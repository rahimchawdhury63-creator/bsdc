import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type DocumentSnapshot
} from 'firebase/firestore';
import { db } from '@config/firebase';
import { FIRESTORE_COLLECTIONS } from '@config/constants';
import type { BSDCPost, PostLocation, PostType, PostVisibility, ServiceResult } from '@/types';

/** Payload used by post creation forms for all fifteen BSDC post types. */
export interface CreatePostPayload {
  readonly type: PostType;
  readonly authorId: string;
  readonly communityId?: string | undefined;
  readonly title: string;
  readonly content: string;
  readonly excerpt: string;
  readonly imageUrls: readonly string[];
  readonly codeContent?: string | undefined;
  readonly language?: string | undefined;
  readonly tags: readonly string[];
  readonly location?: PostLocation | undefined;
  readonly visibility: PostVisibility;
  readonly pollOptions?: readonly { readonly id: string; readonly label: string; readonly votesCount: number }[] | undefined;
}

/** Payload used when authors edit an existing post. */
export interface UpdatePostPayload {
  readonly title?: string | undefined;
  readonly content?: string | undefined;
  readonly excerpt?: string | undefined;
  readonly imageUrls?: readonly string[] | undefined;
  readonly tags?: readonly string[] | undefined;
  readonly visibility?: PostVisibility | undefined;
}

/** Creates a URL-safe SEO slug from title text and current timestamp. */
export const createPostSlug = (title: string): string => {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0980-\u09FF]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
  return `${base || 'bsdc-post'}-${Date.now().toString(36)}`;
};

/** Creates a short text excerpt when authors do not provide one explicitly. */
export const createPostExcerpt = (content: string): string => content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 180);

/** Safely maps a single Firestore document into the BSDCPost model. */
export const mapPostSnapshot = (snapshot: DocumentSnapshot<DocumentData>): BSDCPost | null => {
  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  return {
    id: snapshot.id,
    type: data.type,
    authorId: String(data.authorId || ''),
    communityId: typeof data.communityId === 'string' ? data.communityId : undefined,
    title: String(data.title || ''),
    content: String(data.content || ''),
    excerpt: String(data.excerpt || ''),
    imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls.filter((url) => typeof url === 'string') : [],
    codeContent: typeof data.codeContent === 'string' ? data.codeContent : undefined,
    language: typeof data.language === 'string' ? data.language : undefined,
    tags: Array.isArray(data.tags) ? data.tags.filter((tag) => typeof tag === 'string') : [],
    location: data.location,
    visibility: data.visibility || 'public',
    slug: String(data.slug || snapshot.id),
    seoTitle: String(data.seoTitle || data.title || ''),
    seoDescription: String(data.seoDescription || data.excerpt || ''),
    likesCount: Number(data.likesCount || 0),
    commentsCount: Number(data.commentsCount || 0),
    sharesCount: Number(data.sharesCount || 0),
    viewsCount: Number(data.viewsCount || 0),
    isEdited: Boolean(data.isEdited),
    isPinned: Boolean(data.isPinned),
    isFeatured: Boolean(data.isFeatured),
    pollOptions: Array.isArray(data.pollOptions) ? data.pollOptions : undefined,
    job: data.job,
    event: data.event,
    expiresAt: data.expiresAt,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };
};

/** Writes a new post to Firestore with SEO fields and counters initialized. */
export const createPost = async (payload: CreatePostPayload): Promise<ServiceResult<string>> => {
  try {
    const slug = createPostSlug(payload.title);
    const excerpt = payload.excerpt.trim() || createPostExcerpt(payload.content);
    const expiresAt = payload.type === 'story' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null;

    const docRef = await addDoc(collection(db, FIRESTORE_COLLECTIONS.posts), {
      type: payload.type,
      authorId: payload.authorId,
      communityId: payload.communityId || null,
      title: payload.title.trim(),
      content: payload.content.trim(),
      excerpt,
      imageUrls: payload.imageUrls,
      codeContent: payload.codeContent || null,
      language: payload.language || null,
      tags: payload.tags.map((tag) => tag.toLowerCase().trim()).filter(Boolean),
      location: payload.location || null,
      visibility: payload.visibility,
      slug,
      seoTitle: `${payload.title.trim()} | BSDC`,
      seoDescription: excerpt,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      viewsCount: 0,
      isEdited: false,
      isPinned: false,
      isFeatured: false,
      pollOptions: payload.pollOptions || null,
      expiresAt,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return { ok: true, data: docRef.id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unable to create post.' };
  }
};

/** Reads a post by Firestore document ID and increments view count once per page load. */
export const getPostById = async (postId: string, incrementView = true): Promise<ServiceResult<BSDCPost | null>> => {
  try {
    const postRef = doc(db, FIRESTORE_COLLECTIONS.posts, postId);
    const snapshot = await getDoc(postRef);
    const post = mapPostSnapshot(snapshot);

    if (post && incrementView) {
      await updateDoc(postRef, { viewsCount: increment(1), updatedAt: serverTimestamp() });
    }

    return { ok: true, data: post };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unable to load post.' };
  }
};

/** Updates a post document owned by the user or allowed by Firestore rules. */
export const updatePost = async (postId: string, payload: UpdatePostPayload): Promise<ServiceResult<true>> => {
  try {
    await updateDoc(doc(db, FIRESTORE_COLLECTIONS.posts, postId), {
      ...payload,
      isEdited: true,
      updatedAt: serverTimestamp()
    });
    return { ok: true, data: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unable to update post.' };
  }
};

/** Deletes a post document using Firestore rules for owner/admin authorization. */
export const deletePost = async (postId: string): Promise<ServiceResult<true>> => {
  try {
    await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.posts, postId));
    return { ok: true, data: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unable to delete post.' };
  }
};
