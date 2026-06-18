import type { Timestamp } from 'firebase/firestore';

/** Fifteen supported post categories defined by the BSDC product specification. */
export type PostType =
  | 'text'
  | 'image'
  | 'qa'
  | 'blog'
  | 'wiki'
  | 'docs'
  | 'code'
  | 'project'
  | 'job'
  | 'notice'
  | 'poll'
  | 'event'
  | 'resource'
  | 'tutorial'
  | 'story';

/** Post visibility controls used by Firestore security rules and UI filters. */
export type PostVisibility = 'public' | 'followers' | 'private';

/** Optional geolocation payload stored on posts when the author enables location. */
export interface PostLocation {
  readonly lat: number;
  readonly lng: number;
  readonly name: string;
}

/** Poll option embedded in poll posts. */
export interface PollOption {
  readonly id: string;
  readonly label: string;
  readonly votesCount: number;
}

/** Job-specific structured metadata for JobPosting schema generation. */
export interface JobMetadata {
  readonly company: string;
  readonly salaryRange: string;
  readonly skillsRequired: readonly string[];
  readonly employmentType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  readonly applyUrl: string;
}

/** Event-specific metadata for Event schema generation and RSVP features. */
export interface EventMetadata {
  readonly startsAt: Timestamp;
  readonly endsAt?: Timestamp;
  readonly venueName: string;
  readonly venueAddress: string;
  readonly rsvpCount: number;
}

/** Canonical Firestore post document shared by feed, profiles, search, and SEO. */
export interface BSDCPost {
  readonly id: string;
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
  readonly slug: string;
  readonly seoTitle: string;
  readonly seoDescription: string;
  readonly likesCount: number;
  readonly commentsCount: number;
  readonly sharesCount: number;
  readonly viewsCount: number;
  readonly isEdited: boolean;
  readonly isPinned: boolean;
  readonly isFeatured: boolean;
  readonly pollOptions?: readonly PollOption[] | undefined;
  readonly job?: JobMetadata | undefined;
  readonly event?: EventMetadata | undefined;
  readonly expiresAt?: Timestamp | undefined;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}
