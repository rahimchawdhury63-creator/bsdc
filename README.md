# Bangladesh Software Development Community (BSDC)

Bangladesh Software Development Community is a React 18, Vite 5, TypeScript, Firebase, SEO-first, PWA community platform for Bangladeshi developers, students, creators, communities, courses, jobs, projects, messaging, points, and knowledge sharing.

## Project identity

- Website name: Bangladesh Software Development Community
- Short name: BSDC
- Website URL: https://www.bsdc.info.bd
- Repository: https://github.com/rahimchawdhury63-creator/bsdc
- Frontend: React 18, Vite 5, TypeScript strict mode
- Hosting: Cloudflare Pages static deployment
- Backend: Firebase Authentication, Firestore, Realtime Database, Cloud Functions
- Push: OneSignal Web Push
- Images: ImgBB primary, Cloudinary secondary for profile/important images
- PWA: installable offline-capable Progressive Web App

## Implemented modules

The workspace contains the production foundation for:

- Firebase configuration
- Authentication with email/password, Google, GitHub, Yahoo
- Auth state store and route guards
- Main layout, sidebars, footer, bottom navigation
- Feed and story system
- Fifteen post type forms
- ImgBB image upload
- Post detail, edit, delete, like, save, share, report
- Comment and nested reply system
- Public profiles and developer ID card
- Follow system
- Realtime presence
- Messaging foundation with RTDB messages, typing indicators, and optional AES encryption
- Notifications with RTDB live events and Firestore history
- BSDC points wallet and secure callable point transfer foundation
- Verification request system
- Community creation, listing, membership, rules, and pages
- Bangla and English search algorithm
- Ads and creator dashboard foundation
- Settings pages
- Courses, exams, certificates, and QR verification
- SEO utilities, schemas, sitemap, RSS, and SSR-meta function foundations
- i18n Bangla/English
- Admin panel with passkey UI gate and Firestore role protection
- Firebase security rules and indexes

## Security notes

- The Cloudinary API Secret and OneSignal REST API Key are intentionally not used in browser code.
- OneSignal sending must happen through Firebase Cloud Functions.
- BSDC points transfers are implemented through a callable Firebase Function so normal users cannot directly edit other users' balances.
- Admin panel access requires both Firestore role (`admin` or `super_admin`) and the configured passkey UI gate.
- Firestore rules restrict sensitive fields such as role, points, counters, and verification status.

## Local build scripts

These scripts are configured for CI/Cloudflare Pages builds. The project owner does not need to run them locally when using Cloudflare Pages dashboard deployment.

- `npm run build` builds the Vite app.
- `npm run typecheck` runs strict TypeScript checking.
- `npm run preview` previews the built site.

## Cloudflare Pages settings

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Node version: 18 or newer

## Required environment variables

Set these in the Cloudflare Pages dashboard:

```text
VITE_SITE_URL=https://www.bsdc.info.bd
VITE_FIREBASE_API_KEY=AIzaSyBNXVLt5eVghQAFySnGEKy6P8H407hwA1E
VITE_FIREBASE_AUTH_DOMAIN=bsdc-bd.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=bsdc-bd
VITE_FIREBASE_STORAGE_BUCKET=bsdc-bd.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1041487418449
VITE_FIREBASE_APP_ID=1:1041487418449:web:350786ca8caf66266a9470
VITE_FIREBASE_DATABASE_URL=https://bsdc-bd-default-rtdb.asia-southeast1.firebasedatabase.app/
VITE_IMGBB_API_KEY=fdbfbcfd3bc5189e50a50c574515298d
VITE_CLOUDINARY_CLOUD_NAME=dpemuwrpz
VITE_CLOUDINARY_UPLOAD_PRESET=bsdc_unsigned
VITE_ONESIGNAL_APP_ID=5f367dc9-3fc3-4fd9-b452-e32fa438509b
```

## Important files

- `src/config/firebase.ts` initializes Firebase.
- `src/App.tsx` defines the application router.
- `firebase/firestore.rules` contains Firestore security rules.
- `firebase/database.rules.json` contains Realtime Database rules.
- `firebase/firestore.indexes.json` contains Firestore indexes.
- `functions/src/index.ts` exports Firebase Functions.
- `public/manifest.webmanifest` defines PWA metadata.
- `public/sw.js` provides the offline fallback worker.
- `_headers` and `public/_headers` define Cloudflare Pages security/cache headers.
- `_redirects` and `public/_redirects` define SPA fallback routing.

## No demo data policy

The application intentionally renders empty states when Firestore has no data. It does not create fake users, fake posts, fake communities, fake ads, fake transactions, fake rankings, fake courses, or fake messages.
