/**
 * src/utils/dateFormatter.js
 * Date helpers — bilingual (en + bn). Firestore timestamps supported.
 */

const EN_DIGITS = ['0','1','2','3','4','5','6','7','8','9'];
const BN_DIGITS = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];

/** Convert Firestore Timestamp / Date / number to JS Date. */
export function toDate(v) {
  if (!v) return null;
  if (v.toDate) return v.toDate();
  if (typeof v === 'number') return new Date(v);
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Numeric digit conversion en ↔ bn. */
export function toBnDigits(s) {
  return String(s).replace(/[0-9]/g, (d) => BN_DIGITS[+d]);
}
export function toEnDigits(s) {
  return String(s).replace(/[০-৯]/g, (d) => EN_DIGITS[BN_DIGITS.indexOf(d)]);
}

/** Twitter-style relative time: "2m", "3h", "5d", "Mar 4". */
export function relativeTime(value, lang = 'en') {
  const d = toDate(value);
  if (!d) return '';
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 5) return lang === 'bn' ? 'এখন' : 'now';
  if (diff < 60) return lang === 'bn' ? `${toBnDigits(diff)} সে` : `${diff}s`;
  const m = Math.floor(diff / 60);
  if (m < 60) return lang === 'bn' ? `${toBnDigits(m)} মি` : `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return lang === 'bn' ? `${toBnDigits(h)} ঘ` : `${h}h`;
  const day = Math.floor(h / 24);
  if (day < 7) return lang === 'bn' ? `${toBnDigits(day)} দি` : `${day}d`;
  return d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', {
    day: '2-digit', month: 'short', year: day > 360 ? 'numeric' : undefined
  });
}

/** Long-form date: "4 March 2026 at 11:32 AM". */
export function longDate(value, lang = 'en') {
  const d = toDate(value);
  if (!d) return '';
  return d.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: 'numeric', minute: '2-digit'
  });
}
