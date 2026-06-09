/**
 * src/utils/qrCodeGenerator.js
 * ---------------------------------------------------------------------------
 * Thin wrapper around the `qrcode` npm package — returns a data URL we can
 * drop into <img src>. Async so callers can await + display a spinner.
 * ---------------------------------------------------------------------------
 */

import QRCode from 'qrcode';

/** Generate a PNG data URL for the given text. */
export async function qrDataURL(text, options = {}) {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: options.width || 280,
    color: { dark: '#1a6b3a', light: '#ffffff' },
    ...options
  });
}

/**
 * Encode a BSDC points-transfer URL.
 * Format: https://www.bsdc.info.bd/points?send=<uid>&amount=<n>
 */
export function buildTransferUrl(uid, amount) {
  const site = import.meta.env.VITE_SITE_URL || 'https://www.bsdc.info.bd';
  const url = new URL(`${site}/points`);
  url.searchParams.set('send', uid);
  if (amount) url.searchParams.set('amount', String(amount));
  return url.toString();
}
