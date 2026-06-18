import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db } from '@config/firebase';
import { FIRESTORE_COLLECTIONS } from '@config/constants';
import { didYouMean, rankSearchResults, type RankedSearchResult, type SearchDocument } from '@/utils/search.algorithm';
import type { ServiceResult } from '@/types';

/** Converts Firestore timestamp-like values into seconds. */
const secondsFrom = (value: unknown): number => typeof value === 'object' && value !== null && 'seconds' in value ? Number((value as { seconds: unknown }).seconds) : 0;

/** Loads searchable post documents from Firestore. */
const loadPostDocuments = async (): Promise<SearchDocument[]> => {
  const snapshot = await getDocs(query(collection(db, FIRESTORE_COLLECTIONS.posts), where('visibility', '==', 'public'), orderBy('createdAt', 'desc'), limit(80)));
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return { id: docSnap.id, type: data.type === 'job' ? 'job' : data.type === 'code' ? 'code' : 'post', title: String(data.title || ''), body: `${data.excerpt || ''} ${data.content || ''}`, tags: Array.isArray(data.tags) ? data.tags : [], url: `/post/${docSnap.id}`, createdAtSeconds: secondsFrom(data.createdAt), popularity: Number(data.viewsCount || 0) + Number(data.likesCount || 0) * 3 } as SearchDocument;
  });
};

/** Loads searchable public user profiles. */
const loadProfileDocuments = async (): Promise<SearchDocument[]> => {
  const snapshot = await getDocs(query(collection(db, FIRESTORE_COLLECTIONS.users), orderBy('createdAt', 'desc'), limit(80)));
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return { id: docSnap.id, type: 'profile', title: String(data.displayName || data.username || ''), body: `${data.bio || ''} ${data.title || ''}`, tags: [String(data.username || '')], url: `/p/${data.username}`, createdAtSeconds: secondsFrom(data.createdAt), popularity: Number(data.followersCount || 0) + Number(data.bsdcPoints || 0) };
  });
};

/** Loads searchable public communities. */
const loadCommunityDocuments = async (): Promise<SearchDocument[]> => {
  const snapshot = await getDocs(query(collection(db, FIRESTORE_COLLECTIONS.communities), orderBy('createdAt', 'desc'), limit(80)));
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return { id: docSnap.id, type: 'community', title: String(data.name || ''), body: String(data.description || ''), tags: Array.isArray(data.tags) ? data.tags : [], url: `/bsdc/${data.slug}`, createdAtSeconds: secondsFrom(data.createdAt), popularity: Number(data.membersCount || 0) };
  });
};

/** Runs universal search across real Firestore collections. */
export const searchBSDC = async (searchQuery: string): Promise<ServiceResult<{ results: readonly RankedSearchResult[]; suggestion: string | null }>> => {
  try {
    const documents = [...await loadPostDocuments(), ...await loadProfileDocuments(), ...await loadCommunityDocuments()];
    const vocabulary = documents.flatMap((document) => [document.title, ...document.tags]).filter(Boolean);
    return { ok: true, data: { results: rankSearchResults(searchQuery, documents), suggestion: didYouMean(searchQuery, vocabulary) } };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Search failed.' };
  }
};
