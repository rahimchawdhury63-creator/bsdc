/**
 * scripts/_loadFirebaseData.js
 * ---------------------------------------------------------------------------
 * Build-time loader. Pulls the data sitemap + RSS need from Firestore using
 * the regular web SDK (anonymous read — same data crawlers would see).
 *
 * Why the web SDK and not Admin SDK?
 *   - Avoids service-account secrets in CI.
 *   - Posts/users/communities are PUBLIC (Firestore Rules allow read).
 *   - Works on GitHub Actions out of the box with the public Firebase config.
 *
 * If Firestore is unreachable (CI offline, project not yet seeded), we
 * fall back to an empty payload — the build still succeeds with a minimal
 * sitemap + RSS so first-deploy never breaks.
 * ---------------------------------------------------------------------------
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, query, where, orderBy, limit, getDocs
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey:        process.env.VITE_FIREBASE_API_KEY        || 'AIzaSyBNXVLt5eVghQAFySnGEKy6P8H407hwA1E',
  authDomain:    process.env.VITE_FIREBASE_AUTH_DOMAIN    || 'bsdc-bd.firebaseapp.com',
  projectId:     process.env.VITE_FIREBASE_PROJECT_ID     || 'bsdc-bd',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'bsdc-bd.firebasestorage.app',
  messagingSenderId: process.env.VITE_FIREBASE_SENDER_ID  || '1041487418449',
  appId:         process.env.VITE_FIREBASE_APP_ID         || '1:1041487418449:web:350786ca8caf66266a9470',
  databaseURL:   process.env.VITE_FIREBASE_DATABASE_URL   || 'https://bsdc-bd-default-rtdb.asia-southeast1.firebasedatabase.app/'
};

let cached = null;

export async function loadIndexData({ postLimit = 2000, userLimit = 2000, communityLimit = 500 } = {}) {
  if (cached) return cached;
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const tasks = [
      getDocs(query(collection(db, 'posts'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(postLimit)
      )),
      getDocs(query(collection(db, 'users'),
        orderBy('updatedAt', 'desc'),
        limit(userLimit)
      )),
      getDocs(query(collection(db, 'communities'),
        orderBy('members', 'desc'),
        limit(communityLimit)
      ))
    ];

    const [postSnap, userSnap, commSnap] = await Promise.all(tasks);
    cached = {
      posts: postSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      users: userSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      communities: commSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[BSDC build] Firestore unreachable; emitting minimal sitemap/RSS. Cause:', err?.message || err);
    cached = { posts: [], users: [], communities: [] };
  }
  return cached;
}
