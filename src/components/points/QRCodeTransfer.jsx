/**
 * src/components/points/QRCodeTransfer.jsx
 * ---------------------------------------------------------------------------
 * Shows MY QR — when scanned, lands on /points?send=<myUid>&amount=...
 * so another member can send points to me with one tap.
 *
 * Also offers a "copy link" fallback and an "open camera scanner" hint
 * (we don't ship a scanner — most camera apps decode QR natively).
 * ---------------------------------------------------------------------------
 */

import React, { useEffect, useState } from 'react';
import { qrDataURL, buildTransferUrl } from '../../utils/qrCodeGenerator.js';
import { bsdcCopyToClipboard, bsdcShare } from '../../scripts/interactions.js';
import { toast } from '../common/Toast.jsx';
import Spinner from '../common/Spinner.jsx';
import { IconCopy, IconShare, IconQR, IconLightning } from '../common/Icons.jsx';

export default function QRCodeTransfer({ uid, username, amount = 0 }) {
  const [src, setSrc] = useState('');
  const [loading, setLoading] = useState(true);
  const url = buildTransferUrl(uid, amount);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    qrDataURL(url, { width: 280 })
      .then((d) => { if (!cancelled) setSrc(d); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [url]);

  const copy = async () => {
    const ok = await bsdcCopyToClipboard(url);
    toast[ok ? 'success' : 'error'](ok ? 'Link copied.' : 'Copy failed.');
  };

  const share = async () => {
    const r = await bsdcShare({ title: `Send BSDC Points to @${username}`, url });
    if (r === 'copied') toast.success('Link copied.');
  };

  return (
    <div className="bsdc-card bsdc-text-center">
      <div className="bsdc-flex bsdc-items-center bsdc-justify-center bsdc-gap-sm bsdc-mb-md">
        <IconQR size={18} color="#1a6b3a" /> <strong>Receive BSDC Points</strong>
      </div>

      <div
        style={{
          width: 280, maxWidth: '100%', aspectRatio: '1 / 1',
          margin: '0 auto', borderRadius: 'var(--radius-md)',
          background: '#fff', padding: 8,
          border: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        {loading ? <Spinner /> : <img src={src} alt={`QR code to send BSDC Points to @${username}`} style={{ width: '100%', height: 'auto' }} />}
      </div>

      <p className="bsdc-text-muted bsdc-text-sm bsdc-mt-md">
        Scan with any phone camera. The sender opens BSDC with your details pre-filled.
      </p>

      <div className="bsdc-flex bsdc-gap-sm bsdc-justify-center bsdc-mt-md">
        <button type="button" className="bsdc-btn bsdc-btn--outline bsdc-btn--sm" onClick={copy}>
          <IconCopy size={14} /> Copy link
        </button>
        <button type="button" className="bsdc-btn bsdc-btn--primary bsdc-btn--sm" onClick={share}>
          <IconShare size={14} /> Share
        </button>
      </div>

      <p className="bsdc-text-xs bsdc-text-muted bsdc-mt-md">
        <IconLightning size={12} color="#1a6b3a" /> Tip: print your QR on event badges for instant point tips.
      </p>
    </div>
  );
}
