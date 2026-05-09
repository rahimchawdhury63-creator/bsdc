// ============================================
// BSDC — Authentication Manager
// Handles: Email, Google, GitHub, Yahoo
// ============================================

import { auth, db, showToast } from './firebase-init.js';
import {
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import {
  doc, setDoc, getDoc, updateDoc, serverTimestamp, increment
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

// ── Provider Setup ──
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

const githubProvider = new GithubAuthProvider();
githubProvider.addScope('user:email');
githubProvider.addScope('read:user');

const yahooProvider = new OAuthProvider('yahoo.com');

// ── Auth State Observer (runs on every page) ──
onAuthStateChanged(auth, async (user) => {
  const navAuth = document.getElementById('nav-auth');
  const navUser = document.getElementById('nav-user');
  const navAvatar = document.getElementById('nav-avatar');
  const dropdownProfile = document.getElementById('dropdown-profile');
  const mobileLogin = document.getElementById('mobile-login');

  if (user) {
    // User is logged in
    if (navAuth) navAuth.classList.add('hidden');
    if (navUser) navUser.classList.remove('hidden');

    // Set avatar
    if (navAvatar && user.photoURL) {
      navAvatar.src = user.photoURL;
      navAvatar.alt = user.displayName || 'User';
    }

    // Profile link
    if (dropdownProfile) {
      dropdownProfile.href = `/profile?uid=${user.uid}`;
    }

    // Mobile menu login → profile
    if (mobileLogin) {
      mobileLogin.href = `/profile?uid=${user.uid}`;
      mobileLogin.textContent = 'My Profile';
    }

    // Ensure user doc exists in Firestore
    await ensureUserDocument(user);

    // Load notifications count
    loadNotificationCount(user.uid);

  } else {
    // Not logged in
    if (navAuth) navAuth.classList.remove('hidden');
    if (navUser) navUser.classList.add('hidden');
  }
});

// ── Create / Update User Document ──
async function ensureUserDocument(user) {
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    // New user — create document
    const username = generateUsername(user.displayName || user.email);
    await setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName || username,
      username: username,
      email: user.email,
      photoURL: user.photoURL || '',
      bio: '',
      role: 'member',
      points: 0,
      postCount: 0,
      answerCount: 0,
      solvedCount: 0,
      joinedAt: serverTimestamp(),
      lastSeen: serverTimestamp(),
      provider: user.providerData[0]?.providerId || 'email',
      isVerified: user.emailVerified,
      oneSignalId: '',
      tags: [],
      social: { github: '', twitter: '', linkedin: '', website: '' }
    });
  } else {
    // Update last seen
    await updateDoc(userRef, {
      lastSeen: serverTimestamp(),
      isVerified: user.emailVerified
    });
  }
}

// ── Username Generator ──
function generateUsername(name) {
  if (!name) return 'dev_' + Math.random().toString(36).substr(2, 6);
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 20) + '_' + Math.random().toString(36).substr(2, 4);
}

// ── Notification Count ──
async function loadNotificationCount(uid) {
  const badge = document.getElementById('notif-badge');
  if (!badge) return;
  // Placeholder — real implementation in notifications.js
  badge.classList.add('hidden');
}

// ── Social Auth Handlers ──
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    showToast(`Welcome, ${result.user.displayName}! 🎉`);
    redirectAfterAuth();
  } catch (err) {
    handleAuthError(err);
  }
}

export async function signInWithGithub() {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    showToast(`Welcome, ${result.user.displayName}! 🎉`);
    redirectAfterAuth();
  } catch (err) {
    handleAuthError(err);
  }
}

export async function signInWithYahoo() {
  try {
    const result = await signInWithPopup(auth, yahooProvider);
    showToast(`Welcome back! 🎉`);
    redirectAfterAuth();
  } catch (err) {
    handleAuthError(err);
  }
}

// ── Email Auth ──
export async function registerWithEmail(email, password, displayName) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    await sendEmailVerification(cred.user);
    showToast('Account created! Please verify your email. 📧');
    redirectAfterAuth();
  } catch (err) {
    handleAuthError(err);
    throw err;
  }
}

export async function loginWithEmail(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    showToast(`Welcome back, ${cred.user.displayName || 'Developer'}! 👋`);
    redirectAfterAuth();
  } catch (err) {
    handleAuthError(err);
    throw err;
  }
}

export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    showToast('Password reset email sent! Check your inbox. 📬');
  } catch (err) {
    handleAuthError(err);
    throw err;
  }
}

// ── Logout ──
export async function logout() {
  try {
    await signOut(auth);
    showToast('Logged out. See you soon! 👋');
    window.location.href = '/';
  } catch (err) {
    showToast('Logout failed. Try again.', 'error');
  }
}

// ── Auth Error Handler ──
function handleAuthError(err) {
  const messages = {
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Try again.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment.',
    'auth/cancelled-popup-request': 'Another sign-in already in progress.',
    'auth/account-exists-with-different-credential': 'An account already exists with a different sign-in method.'
  };
  const msg = messages[err.code] || `Error: ${err.message}`;
  showToast(msg, 'error');
}

// ── Redirect After Auth ──
function redirectAfterAuth() {
  const params = new URLSearchParams(window.location.search);
  const next = params.get('next');
  window.location.href = next || '/';
}

// ── Logout Button Setup (runs on all pages) ──
document.addEventListener('DOMContentLoaded', () => {
  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  // Avatar dropdown toggle
  const avatarBtn = document.getElementById('avatar-btn');
  const avatarDropdown = document.getElementById('avatar-dropdown');
  if (avatarBtn && avatarDropdown) {
    avatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = avatarDropdown.classList.toggle('open');
      avatarBtn.setAttribute('aria-expanded', isOpen);
    });
    document.addEventListener('click', () => {
      avatarDropdown.classList.remove('open');
      avatarBtn.setAttribute('aria-expanded', 'false');
    });
  }

  // Hamburger toggle
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('hidden');
      hamburger.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', !isOpen);
    });
  }

  // Active nav item
  const currentPath = window.location.pathname;
  document.querySelectorAll('.side-nav-item').forEach(item => {
    if (item.getAttribute('href') === currentPath) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
});

// ── Get Current User (utility) ──
export function getCurrentUser() {
  return auth.currentUser;
}

export function requireAuth(redirectPath) {
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      if (user) {
        resolve(user);
      } else {
        window.location.href = `/login?next=${encodeURIComponent(redirectPath || window.location.pathname + window.location.search)}`;
        reject(new Error('Not authenticated'));
      }
    });
  });
}
