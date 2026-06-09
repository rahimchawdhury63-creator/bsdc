# BSDC — Production Deployment Guide

This guide deploys the **Bangladesh Software Development Community (BSDC)** platform end-to-end. Every step uses a web UI — **no CLI is required on your laptop**. Everything that needs a build runs inside GitHub Actions.

By the time you finish you will have:

- A live web app at **https://www.bsdc.info.bd** served by Cloudflare Pages
- Firebase Auth + Firestore + Realtime Database in `asia-southeast1`
- ImgBB uploads (all user images) + Cloudinary (avatars + videos)
- OneSignal Web Push (and the same notifications inside Android)
- A signed-able Android APK built automatically on every push
- An admin panel protected by Google login + a passkey

Total setup time: **~45 minutes** the first time.

---

## 0. What you need before you start

| Account | URL | Why |
| --- | --- | --- |
| GitHub | https://github.com | Source code + automated builds |
| Cloudflare | https://dash.cloudflare.com | Free hosting + free DNS + free TLS |
| Firebase | https://console.firebase.google.com | Auth + Firestore + Realtime DB |
| ImgBB | https://api.imgbb.com | Free image hosting (user uploads) |
| Cloudinary | https://cloudinary.com | Free video + avatar hosting |
| OneSignal | https://onesignal.com | Web Push notifications |
| Domain | namecheap, godaddy, etc. | You already own **bsdc.info.bd** |

A laptop with a browser. That's it.

---

## 1. Push the code to GitHub

1. Go to https://github.com/rahimchawdhury63-creator/bsdc (or create the empty repo).
2. Click **Add file → Upload files** and drag the entire `bsdc/` folder contents into the upload zone. (Or use **Import repository** if you have a zip URL.)
3. Commit on `main`.

The `.github/workflows/deploy.yml` workflow is now present in the repo — but it will fail until we add the secrets in Step 6.

---

## 2. Create the Firebase project

1. Open **https://console.firebase.google.com** → **Add project** → name it **`bsdc-bd`** (project ID matters; the code defaults to this ID).
2. Disable Google Analytics if asked (it's optional).
3. In the project, click the **Web (`</>`)** icon → register a web app called **BSDC Web** → Firebase shows a `firebaseConfig` object. **Copy every value** — you'll paste them as GitHub secrets in Step 6.

### 2a. Enable Authentication

1. Left nav → **Build → Authentication → Get started**.
2. Sign-in method tab → enable:
   - **Email/Password** (toggle on Email link too if you want passwordless later)
   - **Google**
   - **GitHub** — needs a GitHub OAuth app at https://github.com/settings/developers (callback URL is shown by Firebase; copy/paste).
   - **Yahoo** — Firebase shows the exact redirect URI to add to your Yahoo OAuth app.
3. **Settings → Authorized domains** — add `www.bsdc.info.bd` and `bsdc.info.bd`.

### 2b. Enable Firestore

1. **Build → Firestore Database → Create database**.
2. Start in **production mode** (we'll paste rules in a moment).
3. Location: **`asia-south1` (Mumbai)** for low Bangladesh latency.
4. After it's created go to the **Rules** tab, **paste the entire contents of `firebase/firestore.rules`** (from this repo) and click **Publish**.

### 2c. Enable Realtime Database

1. **Build → Realtime Database → Create database**.
2. Location: **`asia-southeast1` (Singapore)** — matches the code's default URL.
3. Start in locked mode → **Rules** tab → paste the entire contents of `firebase/database.rules.json` and **Publish**.

### 2d. Optional: seed the default course

You can create the Course-system seed without any code:
1. Firestore → **Start collection** → ID `courses` → first doc ID `fullstack-bd-101`.
2. Paste these fields one by one (or skip — the bundled `defaultCourse.js` is served as a fallback automatically).

Or simply sign in as the admin once and use **Admin → Courses → Seed default course** which copies the bundled object into Firestore in one click.

---

## 3. Create the ImgBB API key

1. Go to **https://api.imgbb.com** → **Get API Key**.
2. Log in with the Google account you want to attach.
3. Click **Add API key** → name it `bsdc-web` → copy the key.

Keep this tab open — you'll paste it as `VITE_IMGBB_API_KEY` in Step 6.

> Why ImgBB for all user images? Per the project spec, ImgBB is the *only* host for user-uploaded images. Avatars and videos go to Cloudinary; everything else (post images, banners, NID proofs, comment images, chat images, story images) goes through ImgBB.

---

## 4. Configure Cloudinary

1. Sign in at **https://cloudinary.com/console**.
2. Note your **Cloud Name** (top-right). That's `VITE_CLOUDINARY_CLOUD_NAME`.
3. **Settings → Upload → Upload presets → Add upload preset**:
   - Preset name: **`bsdc_unsigned`** (matches the code default)
   - Signing mode: **Unsigned**
   - Folder: `bsdc`
   - Allowed formats: leave at "image, video, raw" (default)
   - Click **Save**
4. **Settings → API Keys** → copy the API key (the secret stays server-only — Bsdc never uploads with it).

> Unsigned uploads are safe because: (a) the preset locks the folder and formats; (b) Firestore Rules still validate who is creating posts; (c) the secret key never reaches the browser.

---

## 5. Create the OneSignal Web Push app

1. **https://onesignal.com** → **New App/Website** → name it **BSDC** → choose **Web** → **Custom Code** integration.
2. **Site URL**: `https://www.bsdc.info.bd`
3. **Default notification icon**: upload the `public/favicon.svg` or a 256×256 PNG.
4. Skip the auto-generated SDK setup — our code already loads the v16 SDK and registers `/OneSignalSDKWorker.js`.
5. After creation, **Settings → Keys & IDs**:
   - **OneSignal App ID** → `VITE_ONESIGNAL_APP_ID`
   - **REST API Key** → `ONESIGNAL_REST_API_KEY` (server-only — never `VITE_*`)

---

## 6. Add every GitHub Actions secret

Open your GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**. Add each of the following one at a time.

| Secret name | Value | Source |
| --- | --- | --- |
| `CLOUDFLARE_API_TOKEN` | a Pages-edit token | see Step 7 |
| `CLOUDFLARE_ACCOUNT_ID` | shown in your CF dashboard URL | Cloudflare |
| `VITE_FIREBASE_API_KEY` | from Step 2 | Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | `bsdc-bd.firebaseapp.com` | Firebase |
| `VITE_FIREBASE_PROJECT_ID` | `bsdc-bd` | Firebase |
| `VITE_FIREBASE_STORAGE_BUCKET` | `bsdc-bd.firebasestorage.app` | Firebase |
| `VITE_FIREBASE_SENDER_ID` | from Step 2 | Firebase |
| `VITE_FIREBASE_APP_ID` | from Step 2 | Firebase |
| `VITE_FIREBASE_DATABASE_URL` | `https://bsdc-bd-default-rtdb.asia-southeast1.firebasedatabase.app/` | Firebase |
| `VITE_IMGBB_API_KEY` | from Step 3 | ImgBB |
| `VITE_CLOUDINARY_CLOUD_NAME` | from Step 4 | Cloudinary |
| `VITE_CLOUDINARY_API_KEY` | from Step 4 | Cloudinary |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | `bsdc_unsigned` | Cloudinary |
| `VITE_ONESIGNAL_APP_ID` | from Step 5 | OneSignal |
| `VITE_ADMIN_EMAIL` | `rahimchawdhury63@gmail.com` | the admin's Google email |
| `VITE_ADMIN_PASSKEY` | `RahimRahim` (or your own) | choose |
| `VITE_SITE_URL` | `https://www.bsdc.info.bd` | the site |
| `VITE_SITE_NAME` | `Bangladesh Software Development Community` | the site |
| `VITE_SITE_SHORT_NAME` | `BSDC` | the site |

> **What about Cloudinary secret + OneSignal REST API key?** These are NOT prefixed `VITE_` and therefore never reach the browser. They are only used by build-time scripts and server tasks. You do not need to put them in GitHub Actions secrets right now — the live app does not require them. Add them later only if you build a server-side broadcaster (see "Optional hardening" at the end).

---

## 7. Create the Cloudflare Pages project

1. **https://dash.cloudflare.com** → **Workers & Pages → Create application → Pages → Connect to Git**.
2. Authorise Cloudflare to read your GitHub repo, pick **`bsdc`**.
3. Build settings:
   - **Framework preset**: *None*
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: leave blank
   - **Node version** (Environment variables): `NODE_VERSION = 20`
4. Click **Save and Deploy**. The first build will fail because secrets aren't injected from GitHub — that's fine. We're going to use GitHub Actions as the build pipeline instead.
5. **Project → Settings → Builds & deployments → Production branch** → confirm `main`.
6. **Project → Settings → Environment variables** → add the same `VITE_*` values you put in GitHub (Cloudflare reads them too for direct deploys + previews). Click **Save**.

### 7a. Generate the Cloudflare API token used by GitHub Actions

1. **My Profile → API Tokens → Create Token → Use template "Edit Cloudflare Workers"**.
2. **Permissions** → add **`Cloudflare Pages — Edit`**.
3. Limit to your account → Create.
4. Copy the token → paste into the GitHub secret `CLOUDFLARE_API_TOKEN`.
5. Your **Account ID** is the hex string in the dashboard URL → paste into `CLOUDFLARE_ACCOUNT_ID`.

### 7b. Re-deploy from GitHub

Push any tiny change to `main` (or trigger **Actions → Deploy BSDC to Cloudflare Pages → Run workflow**). Within ~2 minutes the green check appears and the site is live at the Pages preview URL (e.g. `bsdc.pages.dev`).

---

## 8. Connect your custom domain

1. **Cloudflare Pages project → Custom domains → Set up a custom domain** → enter `www.bsdc.info.bd`.
2. Follow the prompts. Cloudflare automatically issues a free TLS certificate via Let's Encrypt within a couple of minutes.
3. Add the apex (`bsdc.info.bd`) too and configure it to **301 → www**.
4. Back in Firebase → **Auth → Settings → Authorized domains** → make sure `www.bsdc.info.bd` and `bsdc.info.bd` are listed.

Visit **https://www.bsdc.info.bd** — you should see the BSDC home page.

---

## 9. First-time admin sign-in

1. Visit `/register` → sign in with the admin Google account (`VITE_ADMIN_EMAIL`).
2. Visit `/admin` → you'll be asked for the passkey (`VITE_ADMIN_PASSKEY`).
3. On successful entry, BSDC writes `/admins/{your-uid}` and flips your `users/{uid}.isAdmin` flag. **From then on, Firestore Rules allow you to perform every admin action.**

Open **Admin → Courses → Seed default course** to copy the bundled 10,000-word course into Firestore (optional — the fallback already works).

---

## 10. Verify the live site

| Test | Expected |
| --- | --- |
| Home loads with feed | ✅ |
| Sign up with Google | Email verified → land on home, daily +3 BSDC Points fires |
| Edit profile → upload banner | ImgBB URL saved on `users/{uid}.bannerURL` |
| Edit profile → upload avatar | Cloudinary URL saved on `users/{uid}.photoURL` |
| Create a Code Snippet post | New `posts/{id}` doc with auto-SEO + slug |
| Like / comment | Author receives realtime notification + bell badge |
| Visit `/messages?with=<uid>` | Realtime chat appears, typing + seen work |
| Visit `/dev-id` | Printable BSDC ID card with QR |
| Pass the course exam | `/certificate/{id}` page lists the certificate |
| Sitemap | `https://www.bsdc.info.bd/sitemap.xml` returns XML |
| RSS | `https://www.bsdc.info.bd/rss.xml` returns RSS 2.0 |

If any step fails, check **GitHub → Actions → latest run → Build logs** first.

---

## 11. Submit to Google + Bing

1. **Google Search Console** → https://search.google.com/search-console
   - Add property: `https://www.bsdc.info.bd` (URL prefix).
   - Verify via **HTML tag** (paste the meta into the `searchConsoleVerification` field in Admin → SEO → save → re-deploy).
   - Open **Sitemaps** → submit `sitemap.xml`.
2. **Bing Webmaster Tools** → https://www.bing.com/webmasters → import from GSC in one click. Submit the same sitemap.
3. **DuckDuckGo** indexes via Bing — no separate submission required.

---

## 12. Android APK (Capacitor)

1. Push any change to `main`. The `android-build.yml` workflow runs automatically (or trigger it manually).
2. When the run finishes, open the run page → **Artifacts** → **`bsdc-android-debug-apk`** → download the zip → extract `app-debug.apk`.
3. Sideload to any Android phone for testing, or follow Google's signing guide and upload `app-release.aab` to Play Console.

### Capacitor notes
- The Capacitor wrapper points at the live URL by default (`hostname: www.bsdc.info.bd` in `capacitor/capacitor.config.json`) so updates ship instantly without re-uploading an APK.
- The `android/` folder is bootstrapped on the first CI run (`npx cap add android`) — committing it to the repo is optional.
- Splash screen + status bar match the BSDC dark-green brand.
- OneSignal Web Push works inside the WebView automatically; for true native Android push you can later add the **OneSignal Android SDK** via Capacitor plugin — but the web flow already covers 95% of users.

---

## 13. Day-to-day operations

| Task | Where |
| --- | --- |
| Add / remove admins | `/admin/users` → click the shield icon next to a user |
| Approve verifications | `/admin/verifications` |
| Featured post | `/admin/posts` → click the star |
| Send platform-wide push | `/admin/notifications` → "Everyone" |
| Adjust point rules | `/admin/points` |
| Enable maintenance mode | `/admin/system` → toggle |
| Edit global SEO meta | `/admin/seo` → save → push to trigger re-deploy |
| Regenerate sitemap + RSS | Push any commit, or trigger the deploy workflow manually |

---

## 14. Optional hardening (do later if you want)

- **Authenticated OneSignal sends.** Replace `notifyXxx()`'s direct REST call with a Firebase Function that injects the secret key. The hook is already isolated in `src/utils/notificationSender.js`.
- **Captcha on registration.** Add reCAPTCHA Enterprise (free tier) via Firebase App Check.
- **Sentry error tracking.** Add `@sentry/react`, set `VITE_SENTRY_DSN` as a secret, init in `main.jsx`.
- **Stricter Firestore rules on `notifications`.** Currently any auth'd user can create a notification doc for any recipient (to let `notifyXxx()` work from the client). For a hostile-user threat model, move notification writes into a Function that validates the relationship.
- **Custom Android push.** Capacitor + OneSignal Android SDK. The web push setup already handles 95% of platforms.

---

## 15. Troubleshooting

| Symptom | Fix |
| --- | --- |
| **404 on every route** | The `public/_redirects` file is missing in `dist/`. Confirm it exists in `public/` and is being copied. Cloudflare needs it to serve SPA. |
| **"Missing or insufficient permissions" in Firestore** | Rules weren't published, or the user's email isn't verified for a post create. Open Firestore → Rules → Publish. |
| **Profile image not loading** | The Cloudinary upload preset isn't `bsdc_unsigned`, or it's set to "Signed". Fix in Cloudinary dashboard. |
| **No push notifications** | Visit `/notifications` → enable push from the banner. Browser must be HTTPS (Cloudflare gives this for free). |
| **Admin passkey rejected** | The `VITE_ADMIN_PASSKEY` secret value differs from what you're typing. Re-check spelling. |
| **Build fails on `generate:sitemap`** | The script swallows Firestore errors and emits a minimal sitemap, so this is rare. Check the Action log for the actual cause. |

---

## 16. Repository layout cheat-sheet

```
bsdc/
├── .github/workflows/
│   ├── deploy.yml             # Cloudflare Pages auto-deploy
│   └── android-build.yml      # Capacitor Android APK build
├── public/                    # served as-is by Cloudflare
│   ├── _headers _redirects robots.txt manifest.json
│   ├── OneSignalSDKWorker.js favicon.svg
│   └── sitemap.xml rss.xml    # generated at build
├── scripts/
│   ├── _loadFirebaseData.js
│   ├── generate-sitemap.js
│   └── generate-rss.js
├── capacitor/capacitor.config.json
├── firebase/                  # deploy bundle for Firebase Console
│   ├── firestore.rules
│   └── database.rules.json
├── src/                       # React 18 + Vite 5 source
│   ├── App.jsx main.jsx
│   ├── firebase/  …
│   ├── context/  …
│   ├── hooks/  …
│   ├── utils/  …
│   ├── components/  …
│   ├── pages/  …
│   ├── admin/   …
│   ├── data/defaultCourse.js  # the 10k-word seed course
│   ├── styles/  …
│   └── scripts/  …
├── index.html                 # SEO-critical root
├── vite.config.js
├── package.json
├── .env.example
├── README.md
└── DEPLOYMENT.md              # this file
```

---

You're live. Welcome to BSDC — now make it yours.
