import { useMemo } from 'react';
import { EMPTY_PERSONALIZATION_PROFILE, rankFeedPosts, type FeedPersonalizationProfile } from '@/utils/feed.algorithm';
import type { BSDCPost } from '@/types';
import type { FeedType } from '@/services/feed.service';

/** LocalStorage key for privacy-friendly feed preferences. */
const PERSONALIZATION_KEY = 'bsdc.feed.personalization.v1';

/** Reads local personalization preferences without failing server-like environments. */
const readProfile = (): FeedPersonalizationProfile => {
  if (typeof window === 'undefined') {
    return EMPTY_PERSONALIZATION_PROFILE;
  }

  try {
    const raw = window.localStorage.getItem(PERSONALIZATION_KEY);
    if (!raw) {
      return EMPTY_PERSONALIZATION_PROFILE;
    }

    const parsed = JSON.parse(raw) as Partial<FeedPersonalizationProfile>;
    return {
      clickedTags: Array.isArray(parsed.clickedTags) ? parsed.clickedTags : [],
      searchedTerms: Array.isArray(parsed.searchedTerms) ? parsed.searchedTerms : [],
      preferredPostTypes: Array.isArray(parsed.preferredPostTypes) ? parsed.preferredPostTypes : []
    };
  } catch {
    return EMPTY_PERSONALIZATION_PROFILE;
  }
};

/** Hook that ranks real Firestore posts for a selected feed type. */
export const usePersonalizedFeed = (posts: readonly BSDCPost[], feedType: FeedType) => {
  const profile = useMemo(readProfile, []);
  return useMemo(() => rankFeedPosts(posts, feedType, profile), [feedType, posts, profile]);
};
