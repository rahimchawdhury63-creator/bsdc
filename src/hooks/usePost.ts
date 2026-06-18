import { useCallback, useEffect, useState } from 'react';
import { createPost, deletePost, getPostById, updatePost, type CreatePostPayload, type UpdatePostPayload } from '@/services/post.service';
import type { BSDCPost } from '@/types';

/** Hook result for post detail loading and CRUD operations. */
export interface UsePostResult {
  readonly post: BSDCPost | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly create: (payload: CreatePostPayload) => Promise<string | null>;
  readonly update: (postId: string, payload: UpdatePostPayload) => Promise<boolean>;
  readonly remove: (postId: string) => Promise<boolean>;
  readonly reload: () => Promise<void>;
}

/** Hook for loading a post and performing Firestore-backed post mutations. */
export const usePost = (postId?: string): UsePostResult => {
  const [post, setPost] = useState<BSDCPost | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(postId));
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!postId) {
      return;
    }
    setIsLoading(true);
    const result = await getPostById(postId);
    setIsLoading(false);
    if (result.ok) {
      setPost(result.data);
      setError(null);
    } else {
      setError(result.error);
    }
  }, [postId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const create = useCallback(async (payload: CreatePostPayload) => {
    const result = await createPost(payload);
    if (!result.ok) {
      setError(result.error);
      return null;
    }
    return result.data;
  }, []);

  const update = useCallback(async (targetPostId: string, payload: UpdatePostPayload) => {
    const result = await updatePost(targetPostId, payload);
    if (!result.ok) {
      setError(result.error);
      return false;
    }
    await reload();
    return true;
  }, [reload]);

  const remove = useCallback(async (targetPostId: string) => {
    const result = await deletePost(targetPostId);
    if (!result.ok) {
      setError(result.error);
      return false;
    }
    setPost(null);
    return true;
  }, []);

  return { post, isLoading, error, create, update, remove, reload };
};
