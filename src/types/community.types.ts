import type { Timestamp } from 'firebase/firestore';

/** Community document for Reddit-like communities and wiki ownership. */
export interface BSDCCommunity {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly bannerURL: string | null;
  readonly iconURL: string | null;
  readonly creatorId: string;
  readonly moderators: readonly string[];
  readonly membersCount: number;
  readonly postsCount: number;
  readonly rules: readonly string[];
  readonly isPrivate: boolean;
  readonly tags: readonly string[];
  readonly createdAt: Timestamp;
}
