/**
 * BSDC Auth Helper
 * Additional auth utilities loaded on auth pages
 */

// Auth is already handled in firebase-config.js
// This file provides any additional page-specific auth helpers

window.BSDC = window.BSDC || {};

window.BSDC.authHelpers = {
  // Validate email format
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  // Validate username
  isValidUsername(username) {
    return /^[a-z0-9_]{3,30}$/.test(username);
  },

  // Format Firebase error messages
  formatError(code) {
    const map = {
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/email-already-in-use': 'Email already registered.',
      'auth/weak-password': 'Password too weak. Use 8+ characters.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/too-many-requests': 'Too many attempts. Please wait.',
      'auth/network-request-failed': 'Network error. Check your connection.',
      'auth/popup-closed-by-user': 'Sign-in popup was closed.',
      'auth/cancelled-popup-request': 'Sign-in cancelled.',
      'auth/invalid-credential': 'Invalid email or password.'
    };
    return map[code] || 'An error occurred. Please try again.';
  }
};
