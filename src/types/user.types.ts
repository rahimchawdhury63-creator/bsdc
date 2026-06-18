import type { Timestamp } from 'firebase/firestore';

/** All supported user roles, ordered from normal access to highest privilege. */
export type UserRole = 'user' | 'creator' | 'moderator' | 'admin' | 'super_admin';

/** Supported visual themes stored in the user's Firestore preferences object. */
export type UserTheme = 'light' | 'dark' | 'system';

/** Supported interface languages for full Bangla and English localization. */
export type UserLanguage = 'bn' | 'en';

/** External or portfolio link displayed on a public profile. */
export interface UserProfileLink {
  readonly label: string;
  readonly url: string;
  readonly type: 'portfolio' | 'github' | 'linkedin' | 'facebook' | 'website' | 'other';
}

/** Device session metadata used by settings and security pages. */
export interface UserDeviceSession {
  readonly deviceId: string;
  readonly lastLogin: Timestamp;
  readonly userAgent: string;
  readonly location?: string;
}

/** Notification preferences keep noisy channels user-controlled. */
export interface UserNotificationPreferences {
  readonly follows: boolean;
  readonly likes: boolean;
  readonly comments: boolean;
  readonly replies: boolean;
  readonly mentions: boolean;
  readonly messages: boolean;
  readonly points: boolean;
  readonly verification: boolean;
  readonly push: boolean;
  readonly sound: boolean;
}

/** Complete preferences object stored inside users/{uid}. */
export interface UserPreferences {
  readonly language: UserLanguage;
  readonly theme: UserTheme;
  readonly notifications: UserNotificationPreferences;
  readonly feedType: 'for-you' | 'following' | 'trending' | 'discover';
}

/** Canonical Firestore user document used across profile, auth, admin, and SEO. */
export interface BSDCUser {
  readonly uid: string;
  readonly username: string;
  readonly displayName: string;
  readonly email: string;
  readonly photoURL: string | null;
  readonly bannerURL: string | null;
  readonly bio: string;
  readonly title: string;
  readonly location: string;
  readonly website: string;
  readonly links: readonly UserProfileLink[];
  readonly role: UserRole;
  readonly isVerified: boolean;
  readonly verificationBadge: string | null;
  readonly bsdcPoints: number;
  readonly bsdcPointsTotal: number;
  readonly followersCount: number;
  readonly followingCount: number;
  readonly postsCount: number;
  readonly isMonetized: boolean;
  readonly monetizationTier: string | null;
  readonly devices: readonly UserDeviceSession[];
  readonly preferences: UserPreferences;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}
