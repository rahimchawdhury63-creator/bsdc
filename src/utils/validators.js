/**
 * src/utils/validators.js
 * Form validators — pure functions, no React.
 */

export function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function passwordStrength(pw) {
  if (!pw || pw.length < 6) return { score: 0, label: 'Too short', ok: false };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ['Weak', 'Okay', 'Good', 'Strong', 'Very strong'];
  return { score, label: labels[score] || 'Weak', ok: score >= 1 };
}

export function isValidUrl(s) {
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch { return false; }
}

/** Bangladeshi mobile validation (01XXXXXXXXX). */
export function isValidBdMobile(s) {
  return typeof s === 'string' && /^01[3-9]\d{8}$/.test(s.replace(/\s|-/g, ''));
}
