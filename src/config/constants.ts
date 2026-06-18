/**
 * Central constants for Bangladesh Software Development Community.
 * Keeping brand, route, SEO, and integration constants together prevents silent
 * mismatches between pages, schema output, PWA metadata, and Firebase records.
 */
export const SITE_NAME = 'Bangladesh Software Development Community';
export const SITE_SHORT_NAME = 'BSDC';
export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://www.bsdc.info.bd';
export const GITHUB_REPOSITORY_URL = 'https://github.com/rahimchawdhury63-creator/bsdc';
export const DEFAULT_LANGUAGE = 'bn';
export const SUPPORTED_LANGUAGES = ['bn', 'en'] as const;

/** Color tokens mirror src/styles/global.css and manifest.webmanifest. */
export const THEME_COLORS = {
  primary: '#1B4332',
  primaryLight: '#2D6A4F',
  primaryLighter: '#40916C',
  accent: '#FFD60A',
  white: '#FFFFFF',
  gray50: '#F8F9FA',
  text: '#1A1A1A'
} as const;

/** Public Firebase collection names used by services and security rules. */
export const FIRESTORE_COLLECTIONS = {
  users: 'users',
  posts: 'posts',
  comments: 'comments',
  follows: 'follows',
  likes: 'likes',
  communities: 'communities',
  messages: 'messages',
  notifications: 'notifications',
  pointTransactions: 'pointTransactions',
  verifications: 'verifications',
  ads: 'ads',
  courses: 'courses',
  certificates: 'certificates',
  stories: 'stories',
  wikis: 'wikis',
  siteSettings: 'siteSettings'
} as const;

/** Realtime Database paths are centralized to avoid divergent client code. */
export const RTDB_PATHS = {
  presence: 'presence',
  messages: 'messages',
  typing: 'typing',
  notifications: 'notifications',
  pointsLive: 'points-live',
  storiesLive: 'stories-live'
} as const;

/** Route definitions allow navigation, SEO, sitemap, and tests to share paths. */
export const ROUTES = {
  home: '/',
  feed: '/feed',
  explore: '/explore',
  search: '/search',
  messenger: '/messenger',
  notifications: '/notifications',
  wallet: '/points/wallet',
  leaderboard: '/points/leaderboard',
  communities: '/communities',
  courses: '/courses',
  idCard: '/id-card',
  verification: '/verification/apply',
  admin: '/admin'
} as const;

/** SEO defaults used when dynamic data has not loaded yet. */
export const DEFAULT_SEO = {
  title: `${SITE_NAME} | ${SITE_SHORT_NAME}`,
  description:
    "Bangladesh's premier software development community platform for developers, students, creators, jobs, projects, courses, messages, points, and technical knowledge.",
  image: `${SITE_URL}/apple-touch-icon.png`,
  canonical: SITE_URL
} as const;

/** Public integration constants; secrets must stay server-side only. */
export const PUBLIC_INTEGRATIONS = {
  imgbbApiKey: import.meta.env.VITE_IMGBB_API_KEY || '',
  cloudinaryCloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
  cloudinaryUploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
  oneSignalAppId: import.meta.env.VITE_ONESIGNAL_APP_ID || ''
} as const;
