import type { BSDCPost } from '@/types';
import type { FeedType } from '@/services/feed.service';

/** User interaction profile used for deterministic client-side personalization. */
export interface FeedPersonalizationProfile {
  readonly clickedTags: readonly string[];
  readonly searchedTerms: readonly string[];
  readonly preferredPostTypes: readonly string[];
}

/** Returns a bounded numeric score so client sorting remains deterministic. */
const clampScore = (score: number): number => Math.max(0, Math.min(10_000, score));

/** Calculates freshness points from a Firestore timestamp-like object. */
const calculateFreshnessScore = (post: BSDCPost): number => {
  const seconds = typeof post.createdAt?.seconds === 'number' ? post.createdAt.seconds : 0;
  if (!seconds) {
    return 0;
  }

  const ageHours = Math.max(0, (Date.now() / 1000 - seconds) / 3600);
  return Math.max(0, 120 - ageHours);
};

/** Calculates engagement points from visible public counters. */
const calculateEngagementScore = (post: BSDCPost): number =>
  post.likesCount * 4 + post.commentsCount * 6 + post.sharesCount * 8 + Math.log10(post.viewsCount + 1) * 10;

/** Calculates personalization points from local, cookie-like browser behavior. */
const calculatePreferenceScore = (post: BSDCPost, profile: FeedPersonalizationProfile): number => {
  const tagScore = post.tags.reduce((score, tag) => score + (profile.clickedTags.includes(tag.toLowerCase()) ? 18 : 0), 0);
  const typeScore = profile.preferredPostTypes.includes(post.type) ? 25 : 0;
  const termScore = profile.searchedTerms.some((term) => `${post.title} ${post.excerpt} ${post.content}`.toLowerCase().includes(term.toLowerCase())) ? 20 : 0;
  return tagScore + typeScore + termScore;
};

/**
 * Ranks posts for the selected feed tab without using external AI services.
 * The algorithm is transparent, deterministic, and based only on real Firestore
 * counters plus optional local browser interaction history.
 */
export const rankFeedPosts = (posts: readonly BSDCPost[], feedType: FeedType, profile: FeedPersonalizationProfile): readonly BSDCPost[] => {
  const ranked = posts.map((post) => {
    const freshness = calculateFreshnessScore(post);
    const engagement = calculateEngagementScore(post);
    const preference = feedType === 'for-you' ? calculatePreferenceScore(post, profile) : 0;
    const featuredBoost = post.isFeatured ? 80 : 0;
    const pinnedBoost = post.isPinned ? 120 : 0;
    const score = clampScore(freshness + engagement + preference + featuredBoost + pinnedBoost);
    return { post, score };
  });

  return ranked.sort((a, b) => b.score - a.score).map((item) => item.post);
};

/** Empty browser preference profile used when localStorage is unavailable. */
export const EMPTY_PERSONALIZATION_PROFILE: FeedPersonalizationProfile = {
  clickedTags: [],
  searchedTerms: [],
  preferredPostTypes: []
};
