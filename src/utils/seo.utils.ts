import { SITE_URL } from '@config/constants';
/** Creates absolute canonical URL for SEO components and functions. */
export const absoluteUrl = (path: string) => new URL(path, SITE_URL).toString();
/** Escapes XML entities for sitemap and RSS generation. */
export const escapeXml = (value: string) => value.replace(/[<>&'"]/g, (char) => ({ '<':'&lt;', '>':'&gt;', '&':'&amp;', "'":'&apos;', '"':'&quot;' }[char] || char));
