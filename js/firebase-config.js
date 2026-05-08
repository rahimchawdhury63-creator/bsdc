/**
 * BSDC Firebase Configuration
 * Bangladesh Software Development Community
 * Client-side only — Static Cloudflare Pages compatible
 */

// ---- Firebase SDK Imports via CDN ----
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  increment,
  serverTimestamp,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  setDoc
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

// ---- Config ----
const firebaseConfig = {
  apiKey: "AIzaSyBNXVLt5eVghQAFySnGEKy6P8H407hwA1E",
  authDomain: "bsdc-bd.firebaseapp.com",
  projectId: "bsdc-bd",
  storageBucket: "bsdc-bd.firebasestorage.app",
  messagingSenderId: "1041487418449",
  appId: "1:1041487418449:web:350786ca8caf66266a9470"
};

// ---- Init ----
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ---- Auth Providers ----
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
googleProvider.addScope('email');
githubProvider.addScope('user:email');

// ============================================
// AUTH CONTEXT — Global State Manager
// ============================================
window.BSDC = window.BSDC || {};

window.BSDC.auth = {
  currentUser: null,
  userProfile: null,
  listeners: [],

  // Subscribe to auth changes
  subscribe(callback) {
    this.listeners.push(callback);
    // Immediately call with current state
    callback(this.currentUser, this.userProfile);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  },

  // Notify all listeners
  _notify() {
    this.listeners.forEach(cb => cb(this.currentUser, this.userProfile));
  },

  // Sign in with email/password
  async signInEmail(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred;
  },

  // Register with email/password
  async registerEmail(email, password, displayName, username) {
    // Check username availability
    const usernameCheck = await getDocs(
      query(collection(db, 'users'), where('username', '==', username.toLowerCase()))
    );
    if (!usernameCheck.empty) {
      throw new Error('Username already taken. Please choose another.');
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });

    // Create user profile in Firestore
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      displayName,
      username: username.toLowerCase(),
      email,
      photoURL: '',
      bio: '',
      role: 'Member',
      skills: [],
      github: '',
      website: '',
      location: 'Bangladesh',
      createdAt: serverTimestamp(),
      postCount: 0,
      answerCount: 0,
      reputation: 0,
      followers: [],
      following: [],
      isVerified: false
    });

    await sendEmailVerification(cred.user);
    return cred;
  },

  // Google sign in
  async signInGoogle() {
    const cred = await signInWithPopup(auth, googleProvider);
    await this._ensureProfile(cred.user);
    return cred;
  },

  // GitHub sign in
  async signInGitHub() {
    const cred = await signInWithPopup(auth, githubProvider);
    await this._ensureProfile(cred.user);
    return cred;
  },

  // Ensure profile exists (for OAuth)
  async _ensureProfile(user) {
    const ref = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const baseUsername = (user.displayName || user.email.split('@')[0])
        .toLowerCase().replace(/[^a-z0-9]/g, '');
      const username = baseUsername + Math.floor(Math.random() * 9999);
      await setDoc(ref, {
        uid: user.uid,
        displayName: user.displayName || 'BSDC Member',
        username,
        email: user.email,
        photoURL: user.photoURL || '',
        bio: '',
        role: 'Member',
        skills: [],
        github: '',
        website: '',
        location: 'Bangladesh',
        createdAt: serverTimestamp(),
        postCount: 0,
        answerCount: 0,
        reputation: 0,
        followers: [],
        following: [],
        isVerified: false
      });
    }
  },

  // Sign out
  async signOut() {
    await signOut(auth);
    this.currentUser = null;
    this.userProfile = null;
    this._notify();
  },

  // Get user profile by UID
  async getProfile(uid) {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  // Get user profile by username
  async getProfileByUsername(username) {
    const q = query(
      collection(db, 'users'),
      where('username', '==', username.toLowerCase()),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() };
  },

  // Password reset
  async resetPassword(email) {
    await sendPasswordResetEmail(auth, email);
  }
};

// ---- Listen to auth state ----
onAuthStateChanged(auth, async (user) => {
  window.BSDC.auth.currentUser = user;
  if (user) {
    try {
      const profile = await window.BSDC.auth.getProfile(user.uid);
      window.BSDC.auth.userProfile = profile;
    } catch(e) {
      console.warn('Profile fetch failed:', e);
    }
  } else {
    window.BSDC.auth.userProfile = null;
  }
  window.BSDC.auth._notify();
  // Update navbar UI
  if (window.BSDC.updateNavAuth) window.BSDC.updateNavAuth(user);
});

// ============================================
// FIRESTORE HELPERS
// ============================================
window.BSDC.db = {

  // ---- POSTS ----
  async createPost(data) {
    const user = window.BSDC.auth.currentUser;
    if (!user) throw new Error('Must be logged in');
    const profile = window.BSDC.auth.userProfile;

    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 80) + '-' + Date.now().toString(36);

    const postData = {
      ...data,
      slug,
      authorId: user.uid,
      authorName: profile?.displayName || user.displayName,
      authorUsername: profile?.username || '',
      authorAvatar: profile?.photoURL || user.photoURL || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      views: 0,
      upvotes: 0,
      downvotes: 0,
      voters: [],
      commentCount: 0,
      answerCount: 0,
      isSolved: false,
      acceptedAnswerId: null
    };

    const ref = await addDoc(collection(db, 'posts'), postData);
    // Update user post count
    await updateDoc(doc(db, 'users', user.uid), {
      postCount: increment(1)
    });
    return { id: ref.id, slug, ...postData };
  },

  async getPost(slugOrId) {
    // Try by slug first
    const q = query(
      collection(db, 'posts'),
      where('slug', '==', slugOrId),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return { id: snap.docs[0].id, ...snap.docs[0].data() };
    }
    // Try by ID
    const docSnap = await getDoc(doc(db, 'posts', slugOrId));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  async getPosts({ type = null, tag = null, orderField = 'createdAt', lim = 20, after = null } = {}) {
    let q = collection(db, 'posts');
    const constraints = [orderBy(orderField, 'desc'), limit(lim)];
    if (type) constraints.unshift(where('type', '==', type));
    if (tag) constraints.unshift(where('tags', 'array-contains', tag));
    if (after) constraints.push(startAfter(after));
    const snap = await getDocs(query(q, ...constraints));
    return snap.docs.map(d => ({ id: d.id, ...d.data(), _snap: d }));
  },

  async getPostsByUser(uid, lim = 20) {
    const snap = await getDocs(query(
      collection(db, 'posts'),
      where('authorId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(lim)
    ));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async updatePost(id, data) {
    await updateDoc(doc(db, 'posts', id), {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  async deletePost(id) {
    await deleteDoc(doc(db, 'posts', id));
  },

  async votePost(postId, direction) {
    const user = window.BSDC.auth.currentUser;
    if (!user) throw new Error('Must be logged in');

    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    const postData = postSnap.data();
    const voters = postData.voters || [];
    const existing = voters.find(v => v.uid === user.uid);

    if (existing) {
      if (existing.dir === direction) {
        // Remove vote
        await updateDoc(postRef, {
          voters: arrayRemove(existing),
          [direction === 'up' ? 'upvotes' : 'downvotes']: increment(-1)
        });
        return 'removed';
      } else {
        // Change vote
        await updateDoc(postRef, {
          voters: arrayRemove(existing),
        });
        await updateDoc(postRef, {
          voters: arrayUnion({ uid: user.uid, dir: direction }),
          [direction === 'up' ? 'upvotes' : 'downvotes']: increment(1),
          [direction === 'up' ? 'downvotes' : 'upvotes']: increment(-1)
        });
        return 'changed';
      }
    } else {
      await updateDoc(postRef, {
        voters: arrayUnion({ uid: user.uid, dir: direction }),
        [direction === 'up' ? 'upvotes' : 'downvotes']: increment(1)
      });
      return 'added';
    }
  },

  async incrementViews(postId) {
    await updateDoc(doc(db, 'posts', postId), {
      views: increment(1)
    });
  },

  // ---- ANSWERS ----
  async addAnswer(postId, content) {
    const user = window.BSDC.auth.currentUser;
    if (!user) throw new Error('Must be logged in');
    const profile = window.BSDC.auth.userProfile;

    const ref = await addDoc(collection(db, 'posts', postId, 'answers'), {
      content,
      authorId: user.uid,
      authorName: profile?.displayName || user.displayName,
      authorUsername: profile?.username || '',
      authorAvatar: profile?.photoURL || user.photoURL || '',
      createdAt: serverTimestamp(),
      upvotes: 0,
      downvotes: 0,
      voters: [],
      isAccepted: false
    });

    await updateDoc(doc(db, 'posts', postId), {
      answerCount: increment(1)
    });
    await updateDoc(doc(db, 'users', user.uid), {
      answerCount: increment(1)
    });

    return ref.id;
  },

  async getAnswers(postId) {
    const snap = await getDocs(query(
      collection(db, 'posts', postId, 'answers'),
      orderBy('upvotes', 'desc'),
      orderBy('createdAt', 'asc')
    ));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async acceptAnswer(postId, answerId) {
    const user = window.BSDC.auth.currentUser;
    if (!user) throw new Error('Not logged in');
    await updateDoc(doc(db, 'posts', postId, 'answers', answerId), {
      isAccepted: true
    });
    await updateDoc(doc(db, 'posts', postId), {
      isSolved: true,
      acceptedAnswerId: answerId
    });
  },

  // ---- COMMENTS ----
  async addComment(postId, content) {
    const user = window.BSDC.auth.currentUser;
    if (!user) throw new Error('Must be logged in');
    const profile = window.BSDC.auth.userProfile;

    await addDoc(collection(db, 'posts', postId, 'comments'), {
      content,
      authorId: user.uid,
      authorName: profile?.displayName || user.displayName,
      authorUsername: profile?.username || '',
      authorAvatar: profile?.photoURL || user.photoURL || '',
      createdAt: serverTimestamp()
    });

    await updateDoc(doc(db, 'posts', postId), {
      commentCount: increment(1)
    });
  },

  async getComments(postId) {
    const snap = await getDocs(query(
      collection(db, 'posts', postId, 'comments'),
      orderBy('createdAt', 'asc')
    ));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  // ---- SEARCH ----
  async searchPosts(term, type = null) {
    // Firestore doesn't support full-text, so we search by tags + title prefix
    const termLower = term.toLowerCase();
    const constraints = [
      where('searchTerms', 'array-contains', termLower),
      orderBy('createdAt', 'desc'),
      limit(30)
    ];
    if (type) constraints.unshift(where('type', '==', type));
    try {
      const snap = await getDocs(query(collection(db, 'posts'), ...constraints));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch {
      return [];
    }
  },

  // ---- NOTIFICATIONS ----
  async addNotification(userId, data) {
    await addDoc(collection(db, 'users', userId, 'notifications'), {
      ...data,
      createdAt: serverTimestamp(),
      isRead: false
    });
  },

  async getNotifications(userId) {
    const snap = await getDocs(query(
      collection(db, 'users', userId, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(20)
    ));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async markNotificationsRead(userId) {
    const snap = await getDocs(query(
      collection(db, 'users', userId, 'notifications'),
      where('isRead', '==', false)
    ));
    const batch = [];
    snap.docs.forEach(d => {
      batch.push(updateDoc(doc(db, 'users', userId, 'notifications', d.id), { isRead: true }));
    });
    await Promise.all(batch);
  }
};

export { db, auth, googleProvider, githubProvider };
export {
  collection, doc, getDoc, getDocs, addDoc, updateDoc,
  deleteDoc, query, where, orderBy, limit, startAfter,
  increment, serverTimestamp, onSnapshot, arrayUnion,
  arrayRemove, setDoc
};
