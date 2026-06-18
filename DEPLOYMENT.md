# BSDC Deployment Guide

This guide is designed for an Android tablet workflow using GitHub, Cloudflare Pages, Firebase Console, and OneSignal dashboard. Local terminal usage is not required for the project owner.

## 1. Upload project to GitHub

Repository URL:

https://github.com/rahimchawdhury63-creator/bsdc

Recommended Android workflow:

1. Open GitHub in the browser.
2. Open the BSDC repository.
3. Upload the complete project files from the workspace or ZIP archive.
4. Commit changes to the default branch.

## 2. Deploy frontend with Cloudflare Pages

1. Open Cloudflare Dashboard.
2. Go to Workers & Pages.
3. Select Create application.
4. Select Pages.
5. Connect the GitHub repository.
6. Use these build settings:

```text
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Node version: 18
```

7. Add the environment variables listed in `README.md`.
8. Deploy.
9. Add the custom domain:

```text
www.bsdc.info.bd
```

10. Cloudflare Pages automatically uses `_headers` and `_redirects` from the project.

## 3. Firebase Authentication setup

Open Firebase Console for project:

```text
bsdc-bd
```

Enable these sign-in methods:

- Email/password
- Google
- GitHub
- Yahoo

Add authorized domains:

- `www.bsdc.info.bd`
- `bsdc.info.bd`
- `bsdc-bd.firebaseapp.com`
- Cloudflare Pages preview domain if needed

## 4. Firestore setup

In Firebase Console:

1. Open Firestore Database.
2. Create database if not already created.
3. Use production mode.
4. Deploy the rules from:

```text
firebase/firestore.rules
```

5. Create indexes from:

```text
firebase/firestore.indexes.json
```

If Firebase Console shows index links while using the site, open those links and create the required indexes.

## 5. Realtime Database setup

In Firebase Console:

1. Open Realtime Database.
2. Confirm database URL:

```text
https://bsdc-bd-default-rtdb.asia-southeast1.firebasedatabase.app/
```

3. Deploy rules from:

```text
firebase/database.rules.json
```

## 6. Firebase Cloud Functions

Functions are included for:

- sitemap generation
- RSS generation
- SSR-like meta response foundation
- secure BSDC points transfer
- story cleanup
- trending update
- post point awards
- comment point awards
- follow notifications
- verification approval badge update

Function source:

```text
functions/src
```

If using Firebase CLI in a cloud build or trusted CI environment, deploy functions from the repository. If not using CLI, keep the frontend fully functional and deploy functions later from a secure developer environment.

Required sensitive server environment values must remain server-side only:

- OneSignal REST API Key
- Cloudinary API Secret if signed uploads are ever added

Never put those values in Vite frontend variables.

## 7. OneSignal setup

OneSignal App ID is already configured through public frontend variable.

In OneSignal dashboard:

1. Add site URL:

```text
https://www.bsdc.info.bd
```

2. Confirm worker file path:

```text
/OneSignalSDKWorker.js
```

3. Confirm service worker scope:

```text
/
```

Push sending should be performed by Firebase Cloud Functions, not browser code.

## 8. ImgBB setup

ImgBB uploads use:

```text
https://api.imgbb.com/1/upload
```

The browser uploads base64 image data and stores returned URLs in Firestore documents.

## 9. Cloudinary setup

Cloudinary is configured for unsigned uploads through preset:

```text
bsdc_unsigned
```

Do not expose Cloudinary API Secret in frontend code.

## 10. Admin setup

Admin account:

```text
rahimchawdhury63@gmail.com
```

After the user signs in once, manually set the Firestore role:

```text
users/{uid}/role = "super_admin"
```

Admin panel URL:

```text
/admin
```

Passkey page:

```text
/admin/passkey
```

Passkey:

```text
RahimRahim
```

Firestore role is still required. The passkey only gates the admin UI.

## 11. SEO setup

Submit sitemap in Google Search Console:

```text
https://www.bsdc.info.bd/sitemap.xml
```

Submit RSS where supported:

```text
https://www.bsdc.info.bd/rss.xml
```

The static `index.html` includes base SEO tags. React Helmet updates metadata for browser users. Firebase Functions provide dynamic SEO endpoints when deployed.

## 12. Final launch checklist

- Cloudflare Pages build succeeds.
- Custom domain resolves with HTTPS.
- Firebase Auth providers are enabled.
- Firestore rules are deployed.
- Realtime Database rules are deployed.
- Required Firestore indexes are created.
- OneSignal site configuration is complete.
- Admin user role is set to `super_admin`.
- First real post can be created.
- ImgBB image upload works.
- PWA installs on Android.
- Offline page opens when disconnected.
- Search Console receives sitemap.
