# Bangladesh Software Development Community (BSDC)

**Live:** [https://www.bsdc.info.bd](https://www.bsdc.info.bd)
**Repo:** [github.com/rahimchawdhury63-creator/bsdc](https://github.com/rahimchawdhury63-creator/bsdc)
**Deploy guide:** [`DEPLOYMENT.md`](./DEPLOYMENT.md)

BSDC is the open community platform for software developers and students across Bangladesh. It combines the best of dev.to, Reddit, Quora, Telegram, LinkedIn, and Facebook — mobile-first, bilingual (English + Bangla), and tuned for the local ecosystem.

| | |
| --- | --- |
| **Frontend** | React 18 + Vite 5, react-router-dom v6, react-helmet-async |
| **Backend** | Firebase (Auth + Firestore + Realtime DB `asia-southeast1`) — zero servers, zero CLI |
| **Images** | ImgBB (every user-uploaded image) |
| **Avatars + video** | Cloudinary (unsigned upload preset) |
| **Push** | OneSignal Web SDK v16 (also works inside the Capacitor Android wrapper) |
| **Hosting** | Cloudflare Pages (free tier) — global CDN, free TLS |
| **Mobile** | Capacitor + GitHub Actions APK build (no Android Studio needed) |
| **CI/CD** | GitHub Actions: web deploy + Android APK build, both on push to `main` |
| **Build-time SEO** | Auto sitemap.xml + RSS 2.0 from live Firestore data |
| **Responsive** | True 250 → 5000 pixels, mobile-first |
| **Bangla** | First-class support in fonts, dates, slugs, search, content |
| **Zero emoji** | 80+ inline SVG icons, tree-shaken |

## What's inside

10 fully-shipped modules covering ~150 source files and ~20,000 LOC:

1. **Foundation** — Firebase config, security rules, icon library, env template
2. **Layout** — 3-column shell, header, sidebars, mobile bottom nav, drawer, dark theme, 10 responsive breakpoints
3. **Auth + Profile** — Google/GitHub/Yahoo/Email, live username availability, password strength, profile pages with banner/avatar/skills/socials, verification flow
4. **Posts** — universal `PostCreator` for 14 types (text, image, video, Q&A, blog, doc, wiki, code, story, project, job, notice, poll, event), nested comments, optimistic likes
5. **Feed + Search** — `For You` / `Following` / `Trending` / `Nearby` algorithms, custom-ranked client-side search with Bangla normalization + "did you mean", infinite scroll
6. **Chat** — realtime 1:1 + group + Telegram-style channels, typing + seen + presence, image attach (ImgBB), reactions
7. **Points + Notifications + Communities** — atomic transfer engine + QR codes, dual-channel notifications (durable + realtime + push), daily-login bonus, Reddit-style communities
8. **SEO + Routing** — react-helmet-async, JSON-LD for every entity type (Article/QAPage/JobPosting/Course/Event/SoftwareSourceCode/EducationalOccupationalCredential/...), build-time sitemap + RSS, hreflang en/bn, full lazy-loaded router
9. **Developer Tools** — Dev ID Card (PNG + print + QR), 10,037-word default course, 20-MCQ exam with timer, public certificate verifier
10. **Admin + Deployment** — passkey + email gated admin panel with 12 sub-pages (Users/Posts/Verifications/Analytics/Points/Ads/Notifications/Courses/Communities/Reports/SEO/System), GitHub Actions, Capacitor config, complete deployment walkthrough

## Local development

```bash
cp .env.example .env
# fill in the seven VITE_FIREBASE_* keys + VITE_IMGBB_API_KEY + VITE_CLOUDINARY_* + VITE_ONESIGNAL_APP_ID
npm install
npm run dev    # http://localhost:5173
```

## Production build

```bash
npm run build
# → runs scripts/generate-sitemap.js → scripts/generate-rss.js → vite build
# → outputs dist/
```

## Deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md). Zero CLI is required on your laptop: everything happens in the GitHub + Cloudflare + Firebase web consoles.

## License

MIT © Bangladesh Software Development Community
