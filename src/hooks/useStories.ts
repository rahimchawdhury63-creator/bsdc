import { useCallback, useEffect, useState } from 'react';
import { createTextStory, subscribeToActiveStories, type BSDCStory, type CreateStoryPayload } from '@/services/story.service';

/** Hook result for active stories and text story creation. */
export interface UseStoriesResult {
  readonly stories: readonly BSDCStory[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly createStory: (payload: CreateStoryPayload) => Promise<boolean>;
}

/** Subscribes to real active Firestore stories and exposes a creation helper. */
export const useStories = (): UseStoriesResult => {
  const [stories, setStories] = useState<readonly BSDCStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToActiveStories(
      (nextStories) => {
        setStories(nextStories);
        setIsLoading(false);
        setError(null);
      },
      (message) => {
        setError(message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const createStory = useCallback(async (payload: CreateStoryPayload) => {
    const result = await createTextStory(payload);
    if (!result.ok) {
      setError(result.error);
      return false;
    }
    return true;
  }, []);

  return { stories, isLoading, error, createStory };
};
