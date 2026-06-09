/**
 * src/utils/slugGenerator.js
 * ---------------------------------------------------------------------------
 * SEO slug helpers. Used by post URLs (/blog/:slug, /qa/:slug, /wiki/:slug)
 * and by username validation.
 * ---------------------------------------------------------------------------
 */

/**
 * Slugify any string into a URL-safe form.
 * Supports Bangla → Latin transliteration for the most common characters
 * so a Bangla post still gets a readable English slug for SEO.
 *
 *   "Hello World!" -> "hello-world"
 *   "বাংলা সফটওয়্যার" -> "bangla-software" (when transliteration matches)
 */
const BN_MAP = {
  'অ':'a','আ':'a','ই':'i','ঈ':'i','উ':'u','ঊ':'u','ঋ':'ri','এ':'e','ঐ':'oi','ও':'o','ঔ':'ou',
  'ক':'k','খ':'kh','গ':'g','ঘ':'gh','ঙ':'ng',
  'চ':'ch','ছ':'chh','জ':'j','ঝ':'jh','ঞ':'n',
  'ট':'t','ঠ':'th','ড':'d','ঢ':'dh','ণ':'n',
  'ত':'t','থ':'th','দ':'d','ধ':'dh','ন':'n',
  'প':'p','ফ':'ph','ব':'b','ভ':'bh','ম':'m',
  'য':'y','র':'r','ল':'l','শ':'sh','ষ':'sh','স':'s','হ':'h',
  'া':'a','ি':'i','ী':'i','ু':'u','ূ':'u','ে':'e','ৈ':'oi','ো':'o','ৌ':'ou','্':'','ং':'ng','ঃ':'h','ঁ':'n',
  '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9'
};

export function slugify(input, { maxLen = 80 } = {}) {
  if (!input) return '';
  let s = String(input).trim();
  // Transliterate Bangla characters.
  s = s.split('').map((ch) => BN_MAP[ch] !== undefined ? BN_MAP[ch] : ch).join('');
  s = s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9\s-]/g, '')                     // keep alphanumerics & hyphen
    .replace(/\s+/g, '-')                             // spaces → hyphens
    .replace(/-+/g, '-')                              // collapse hyphens
    .replace(/^-+|-+$/g, '');                         // trim hyphens
  return s.slice(0, maxLen).replace(/-+$/, '');
}

/** Append a short random suffix for uniqueness when slugs collide. */
export function slugifyUnique(input, opts) {
  const base = slugify(input, opts) || 'post';
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

/** Username rule: 3-20 chars, lowercase letters/numbers/underscore, must start with a letter. */
export const USERNAME_REGEX = /^[a-z][a-z0-9_]{2,19}$/;

export function isValidUsername(s) {
  return typeof s === 'string' && USERNAME_REGEX.test(s);
}
