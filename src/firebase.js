import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBNXVLt5eVghQAFySnGEKy6P8H407hwA1E",
  authDomain: "bsdc-bd.firebaseapp.com",
  projectId: "bsdc-bd",
  storageBucket: "bsdc-bd.firebasestorage.app",
  messagingSenderId: "1041487418449",
  appId: "1:1041487418449:web:350786ca8caf66266a9470",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// AUTH PROVIDERS
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

export const githubProvider = new GithubAuthProvider();
githubProvider.addScope('user:email');

export const yahooProvider = new OAuthProvider('yahoo.com');
yahooProvider.addScope('profile');
yahooProvider.addScope('email');

export const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

// IMGBB
export const IMGBB_API_KEY = 'fdbfbcfd3bc5189e50a50c574515298d';

export async function uploadToImgBB(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result.split(',')[1];
        const formData = new FormData();
        formData.append('image', base64);
        const res = await fetch(
          `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
          { method: 'POST', body: formData }
        );
        const data = await res.json();
        if (data.success) {
          resolve(data.data.url);
        } else {
          reject(new Error('ImgBB upload failed'));
        }
      } catch (e) {
        reject(e);
      }
    };
    reader.readAsDataURL(file);
  });
}

// AUTH HELPERS
export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}
export async function signInWithGithub() {
  return signInWithPopup(auth, githubProvider);
}
export async function signInWithYahoo() {
  return signInWithPopup(auth, yahooProvider);
}
export async function signInWithApple() {
  return signInWithPopup(auth, appleProvider);
}
export async function signInEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}
export async function registerEmail(email, password, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  return cred;
}
export async function logOut() {
  return signOut(auth);
}

// FIRESTORE HELPERS
export async function createUserProfile(user, extra = {}) {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      displayName: user.displayName || extra.displayName || 'Anonymous',
      email: user.email,
      photoURL: user.photoURL || '',
      bio: '',
      skills: [],
      github: '',
      linkedin: '',
      website: '',
      location: 'Bangladesh',
      role: 'member',
      reputation: 0,
      postCount: 0,
      joinedAt: serverTimestamp(),
      ...extra,
    });
  }
  return ref;
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getPosts(type = null, pageSize = 20, lastDoc = null) {
  let q;
  const constraints = [orderBy('createdAt', 'desc'), limit(pageSize)];
  if (type) constraints.unshift(where('type', '==', type));
  if (lastDoc) constraints.push(startAfter(lastDoc));
  q = query(collection(db, 'posts'), ...constraints);
  const snap = await getDocs(q);
  return {
    posts: snap.docs.map(d => ({ id: d.id, ...d.data() })),
    lastDoc: snap.docs[snap.docs.length - 1] || null,
  };
}

export async function getPostBySlug(slug) {
  const q = query(collection(db, 'posts'), where('slug', '==', slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

/* ── FIXED createPost — returns doc ref reliably ── */
export async function createPost(data) {
  try {
    const ref = await addDoc(collection(db, 'posts'), {
      ...data,
      upvotes:      0,
      upvotedBy:    [],
      views:        0,
      commentCount: 0,
      solved:       false,
      createdAt:    serverTimestamp(),
      updatedAt:    serverTimestamp(),
    });
    return ref;
  } catch (err) {
    console.error('[createPost] Firestore error:', err);
    throw err; /* re-throw so caller can handle */
  }
}

export async function upvotePost(postId, userId) {
  const ref = doc(db, 'posts', postId);
  const snap = await getDoc(ref);
  const data = snap.data();
  if (data.upvotedBy?.includes(userId)) {
    await updateDoc(ref, {
      upvotes: increment(-1),
      upvotedBy: arrayRemove(userId),
    });
  } else {
    await updateDoc(ref, {
      upvotes: increment(1),
      upvotedBy: arrayUnion(userId),
    });
  }
}

export async function markSolved(postId) {
  await updateDoc(doc(db, 'posts', postId), { solved: true });
}

export async function getComments(postId) {
  const q = query(
    collection(db, 'posts', postId, 'comments'),
    orderBy('createdAt', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addComment(postId, data) {
  return addDoc(collection(db, 'posts', postId, 'comments'), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export {
  onAuthStateChanged,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
};
// Add these exports if not already present
export {
  signInWithPopup,
  fetchSignInMethodsForEmail,
  linkWithPopup,
  linkWithCredential,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  EmailAuthProvider,
} from 'firebase/auth';
