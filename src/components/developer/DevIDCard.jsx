/**
 * src/components/developer/DevIDCard.jsx
 * ---------------------------------------------------------------------------
 * Printable / downloadable BSDC developer ID card.
 *
 * Usage:
 *   - /dev-id                  → own card
 *   - /dev-id/:username        → any public card
 *
 * Two download paths (both require ZERO external libraries):
 *   1. Print (window.print) — works everywhere, produces clean PDF via
 *      browser "Save as PDF" — uses our print.css scoping.
 *   2. PNG download — captures the SVG card as a Blob and triggers a
 *      file download. Pure browser API, no canvas-to-image library.
 * ---------------------------------------------------------------------------
 */

import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { getUserByUsername } from '../../firebase/firestore.js';
import { qrDataURL } from '../../utils/qrCodeGenerator.js';
import { rankFromPoints, formatPoints } from '../../utils/pointsCalculator.js';
import SEOHead from '../seo/SEOHead.jsx';
import BreadcrumbSEO from '../seo/BreadcrumbSEO.jsx';
import { LoadingCenter } from '../common/Spinner.jsx';
import { toast } from '../common/Toast.jsx';
import {
  IconDownload, IconCoin, IconAward, IconLightning, IconQR
} from '../common/Icons.jsx';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://www.bsdc.info.bd';

export default function DevIDCard() {
  const { username } = useParams();
  const { profile: me } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qr, setQr] = useState('');
  const cardRef = useRef(null);

  // Resolve which profile we're rendering.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      let u = null;
      if (username) {
        u = await getUserByUsername(String(username).toLowerCase());
      } else if (me) {
        u = me;
      }
      if (!cancelled) {
        setProfile(u);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [username, me?.uid]);

  // Generate QR pointing to the public profile.
  useEffect(() => {
    if (!profile?.username) return;
    qrDataURL(`${SITE_URL}/p/${profile.username}`, { width: 240 })
      .then(setQr).catch(() => {});
  }, [profile?.username]);

  if (loading) return <LoadingCenter label="Building ID card…" />;

  if (!profile) {
    return (
      <div className="bsdc-empty">
        <div className="bsdc-empty__title">No ID card available</div>
        <Link to="/login" className="bsdc-btn bsdc-btn--primary bsdc-mt-md">Sign in</Link>
      </div>
    );
  }

  const rank = rankFromPoints(profile.bsdcPoints || 0);
  const isMe = me && me.uid === profile.uid;
  const issued = profile.createdAt?.toDate
    ? profile.createdAt.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';
  const cardId = String(profile.uid || '').slice(-8).toUpperCase();

  /** Trigger a clean print of just the card. */
  const onPrint = () => {
    document.body.classList.add('bsdc-print-id');
    setTimeout(() => {
      window.print();
      // Cleanup happens after print dialog closes; afterprint event is async.
      const cleanup = () => {
        document.body.classList.remove('bsdc-print-id');
        window.removeEventListener('afterprint', cleanup);
      };
      window.addEventListener('afterprint', cleanup);
    }, 50);
  };

  /** Download as PNG using an SVG → image → canvas pipeline (no libs). */
  const onDownloadPng = async () => {
    try {
      const svg = cardRef.current?.querySelector('svg');
      if (!svg) throw new Error('Card not ready.');
      const serialized = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });

      // Render at 2x for crisp output.
      const W = 1024, H = 640;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);
      ctx.drawImage(img, 0, 0, W, H);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (!blob) { toast.error('Could not export.'); return; }
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `bsdc-dev-id-${profile.username}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
        toast.success('ID card downloaded.');
      }, 'image/png');
    } catch (err) {
      toast.error(err?.message || 'Could not download.');
    }
  };

  return (
    <>
      <SEOHead
        title={`BSDC Developer ID · @${profile.username}`}
        description={`Official BSDC Developer ID card for @${profile.username}.`}
        canonical={`/dev-id/${profile.username}`}
        noindex={!isMe}
      />
      <BreadcrumbSEO items={[
        { name: 'Home', url: '/' },
        { name: 'Developer ID', url: '/dev-id' },
        { name: `@${profile.username}`, url: `/dev-id/${profile.username}` }
      ]} />

      <div className="bsdc-flex bsdc-items-center bsdc-justify-between bsdc-mb-md">
        <h1 style={{ margin: 0, fontSize: '1.3rem' }}>
          <IconAward size={20} /> BSDC Developer ID
        </h1>
        {isMe && (
          <div className="bsdc-flex bsdc-gap-sm">
            <button type="button" className="bsdc-btn bsdc-btn--outline bsdc-btn--sm" onClick={onPrint}>
              <IconDownload size={14} /> Print / PDF
            </button>
            <button type="button" className="bsdc-btn bsdc-btn--primary bsdc-btn--sm" onClick={onDownloadPng}>
              <IconDownload size={14} /> PNG
            </button>
          </div>
        )}
      </div>

      <p className="bsdc-text-muted bsdc-text-sm">
        Tap to verify the ID by scanning the QR — it links to{' '}
        <Link to={`/p/${profile.username}`}>bsdc.info.bd/p/{profile.username}</Link>.
      </p>

      {/* Card */}
      <div
        ref={cardRef}
        className="bsdc-id-card bsdc-print-only"
        style={{
          width: '100%', maxWidth: 540, margin: '20px auto',
          borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-lg)',
          background: '#fff'
        }}
      >
        <CardSVG profile={profile} rank={rank} qr={qr} issued={issued} cardId={cardId} />
      </div>

      {/* Quick stats below the card */}
      <div className="bsdc-grid-4 bsdc-mt-md" style={{ maxWidth: 540, margin: '0 auto' }}>
        <Stat label="Points" value={formatPoints(profile.bsdcPoints || 0)} icon={<IconCoin size={14} />} />
        <Stat label="Posts" value={profile.postsCount || 0} icon={<IconLightning size={14} />} />
        <Stat label="Followers" value={formatPoints(profile.followers || 0)} icon={<IconAward size={14} />} />
        <Stat label="Card ID" value={cardId} icon={<IconQR size={14} />} />
      </div>
    </>
  );
}

/** Single SVG so PNG export is one element to capture. */
function CardSVG({ profile, rank, qr, issued, cardId }) {
  const W = 512, H = 320;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ display: 'block' }}
      role="img"
      aria-label={`BSDC Developer ID for @${profile.username}`}
    >
      <defs>
        <linearGradient id="bsdc-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a6b3a" />
          <stop offset="100%" stopColor="#0f4a27" />
        </linearGradient>
        <clipPath id="avatarClip">
          <circle cx="80" cy="170" r="48" />
        </clipPath>
      </defs>

      {/* Background */}
      <rect width={W} height={H} fill="url(#bsdc-bg)" />
      {/* Accent stripe */}
      <rect x="0" y="0" width={W} height="48" fill="#ffffff" opacity="0.92" />

      {/* Header */}
      <text x="20" y="32" fontFamily="Inter, sans-serif" fontSize="18" fontWeight="800" fill="#1a6b3a">
        BSDC · Bangladesh Software Development Community
      </text>

      {/* Avatar circle backplate */}
      <circle cx="80" cy="170" r="52" fill="#ffffff" />
      {profile.photoURL ? (
        <image
          href={profile.photoURL}
          x="32" y="122" width="96" height="96"
          clipPath="url(#avatarClip)"
          preserveAspectRatio="xMidYMid slice"
        />
      ) : (
        <g clipPath="url(#avatarClip)">
          <rect x="32" y="122" width="96" height="96" fill="#e8f5e9" />
          <text x="80" y="183" fontFamily="Inter, sans-serif" fontSize="36" fontWeight="700" textAnchor="middle" fill="#1a6b3a">
            {(profile.displayName || profile.username || 'B').slice(0,1).toUpperCase()}
          </text>
        </g>
      )}

      {/* Name + username */}
      <text x="156" y="120" fontFamily="Inter, sans-serif" fontSize="22" fontWeight="800" fill="#ffffff">
        {clip(profile.displayName || profile.username, 22)}
      </text>
      <text x="156" y="146" fontFamily="Inter, sans-serif" fontSize="14" fill="#cde9d4">
        @{clip(profile.username, 24)}
      </text>
      {profile.title && (
        <text x="156" y="170" fontFamily="Inter, sans-serif" fontSize="13" fill="#ffffff" opacity="0.92">
          {clip(profile.title, 36)}
        </text>
      )}

      {/* Rank chip */}
      <g transform="translate(156, 190)">
        <rect width="120" height="26" rx="13" fill={rank.color} />
        <text x="60" y="17" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="12" fontWeight="700" fill="#ffffff">
          {rank.label.toUpperCase()} RANK
        </text>
      </g>

      {/* Points chip */}
      <g transform="translate(286, 190)">
        <rect width="140" height="26" rx="13" fill="#ffffff" />
        <text x="70" y="17" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="12" fontWeight="700" fill="#1a6b3a">
          {formatPoints(profile.bsdcPoints || 0)} BSDC POINTS
        </text>
      </g>

      {/* QR */}
      {qr && (
        <g transform="translate(390, 30)">
          <rect width="100" height="100" fill="#ffffff" rx="8" />
          <image href={qr} x="8" y="8" width="84" height="84" />
        </g>
      )}

      {/* Footer */}
      <line x1="20" y1="262" x2={W - 20} y2="262" stroke="#ffffff" strokeOpacity="0.25" />
      <text x="20" y="284" fontFamily="Inter, sans-serif" fontSize="11" fill="#ffffff" opacity="0.85">
        Card ID
      </text>
      <text x="20" y="302" fontFamily="JetBrains Mono, monospace" fontSize="13" fontWeight="700" fill="#ffffff">
        {cardId}
      </text>

      <text x={W / 2} y="284" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="11" fill="#ffffff" opacity="0.85">
        Issued
      </text>
      <text x={W / 2} y="302" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="13" fontWeight="700" fill="#ffffff">
        {issued || '—'}
      </text>

      <text x={W - 20} y="284" textAnchor="end" fontFamily="Inter, sans-serif" fontSize="11" fill="#ffffff" opacity="0.85">
        Verify
      </text>
      <text x={W - 20} y="302" textAnchor="end" fontFamily="Inter, sans-serif" fontSize="12" fontWeight="700" fill="#ffffff">
        bsdc.info.bd/p/{clip(profile.username, 18)}
      </text>
    </svg>
  );
}

function clip(s = '', max) {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

function Stat({ label, value, icon }) {
  return (
    <div className="bsdc-card bsdc-text-center">
      <div className="bsdc-text-xs bsdc-text-muted">{icon} {label}</div>
      <div className="bsdc-text-bold">{value}</div>
    </div>
  );
}
