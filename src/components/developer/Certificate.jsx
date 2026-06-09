/**
 * src/components/developer/Certificate.jsx
 * ---------------------------------------------------------------------------
 * /certificate/:id — public verification page.
 * Anyone can open this URL and confirm a BSDC certificate is real.
 *
 * Layout:
 *   - Large SVG certificate (printable / downloadable)
 *   - Verification stamp + QR linking back to the same URL
 *   - Issuer info + "Share" buttons
 *
 * Failure view (cert not found, or score below pass mark) clearly shows
 * the result so screenshots can't fake it.
 * ---------------------------------------------------------------------------
 */

import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import { qrDataURL } from '../../utils/qrCodeGenerator.js';
import SEOHead from '../seo/SEOHead.jsx';
import BreadcrumbSEO from '../seo/BreadcrumbSEO.jsx';
import JsonLD from '../seo/JsonLD.jsx';
import { LoadingCenter } from '../common/Spinner.jsx';
import { toast } from '../common/Toast.jsx';
import { bsdcShare } from '../../scripts/interactions.js';
import {
  IconAward, IconCheck, IconClose, IconDownload, IconShare, IconQR
} from '../common/Icons.jsx';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://www.bsdc.info.bd';

export default function Certificate() {
  const { id } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qr, setQr] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getDoc(doc(db, 'certificates', id))
      .then((snap) => {
        if (cancelled) return;
        setCert(snap.exists() ? { id: snap.id, ...snap.data() } : null);
        setLoading(false);
      })
      .catch(() => { if (!cancelled) { setCert(null); setLoading(false); } });
    return () => { cancelled = true; };
  }, [id]);

  // Build QR pointing back to this verify URL.
  useEffect(() => {
    if (!cert) return;
    qrDataURL(`${SITE_URL}/certificate/${cert.id}`, { width: 220 }).then(setQr).catch(() => {});
  }, [cert]);

  const onPrint = () => {
    document.body.classList.add('bsdc-print-cert');
    setTimeout(() => {
      window.print();
      const cleanup = () => {
        document.body.classList.remove('bsdc-print-cert');
        window.removeEventListener('afterprint', cleanup);
      };
      window.addEventListener('afterprint', cleanup);
    }, 50);
  };

  const onShare = async () => {
    const r = await bsdcShare({
      title: `${cert.displayName || cert.username} — BSDC Certificate`,
      text: `Verified BSDC certificate for "${cert.courseTitle}".`,
      url: `${SITE_URL}/certificate/${cert.id}`
    });
    if (r === 'copied') toast.success('Link copied.');
  };

  const onDownloadPng = async () => {
    try {
      const svg = containerRef.current?.querySelector('svg');
      if (!svg) throw new Error('Certificate not ready.');
      const serialized = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
      const W = 1600, H = 1130;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);
      ctx.drawImage(img, 0, 0, W, H);
      URL.revokeObjectURL(url);
      canvas.toBlob((b) => {
        if (!b) { toast.error('Could not export.'); return; }
        const a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = `bsdc-certificate-${cert.username}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
        toast.success('Certificate downloaded.');
      }, 'image/png');
    } catch (err) {
      toast.error(err?.message || 'Could not download.');
    }
  };

  if (loading) return <LoadingCenter label="Verifying certificate…" />;

  if (!cert) {
    return (
      <>
        <SEOHead title="Certificate not found" canonical={`/certificate/${id}`} noindex />
        <div className="bsdc-empty">
          <div className="bsdc-empty__icon"><IconClose /></div>
          <div className="bsdc-empty__title">Certificate not found</div>
          <div className="bsdc-empty__body">No certificate exists for this ID. It may have been revoked.</div>
          <Link to="/courses" className="bsdc-btn bsdc-btn--primary bsdc-mt-md">Browse courses</Link>
        </div>
      </>
    );
  }

  const passed = !!cert.passed;
  const issued = cert.issuedAt?.toDate
    ? cert.issuedAt.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';

  // EducationalOccupationalCredential schema for Google rich result.
  const schema = passed ? {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalCredential',
    '@id': `${SITE_URL}/certificate/${cert.id}`,
    name: cert.courseTitle,
    description: `BSDC certificate awarded to @${cert.username} for ${cert.courseTitle}.`,
    credentialCategory: 'Certificate',
    competencyRequired: cert.courseTitle,
    educationalLevel: 'Beginner / Intermediate',
    recognizedBy: {
      '@type': 'Organization',
      name: 'Bangladesh Software Development Community',
      url: SITE_URL
    },
    dateCreated: cert.issuedAt?.toDate?.()?.toISOString()
  } : null;

  return (
    <>
      <SEOHead
        title={passed
          ? `Certificate · @${cert.username} · ${cert.courseTitle}`
          : `Certificate (not passed) · @${cert.username}`}
        description={passed
          ? `Verified BSDC certificate awarded to @${cert.username} for "${cert.courseTitle}".`
          : `Unverified BSDC exam attempt for "${cert.courseTitle}".`}
        canonical={`/certificate/${cert.id}`}
      />
      {schema && <JsonLD schema={schema} id="cert" />}
      <BreadcrumbSEO items={[
        { name: 'Home', url: '/' },
        { name: 'Courses', url: '/courses' },
        { name: 'Certificate', url: `/certificate/${cert.id}` }
      ]} />

      <div className="bsdc-flex bsdc-items-center bsdc-justify-between bsdc-mb-md">
        <div>
          <span className={`bsdc-badge ${passed ? 'bsdc-badge--success' : 'bsdc-badge--danger'}`}>
            {passed ? <><IconCheck size={12} /> Verified</> : <><IconClose size={12} /> Not passed</>}
          </span>
          <h1 style={{ margin: '6px 0 0', fontSize: '1.3rem' }}>
            <IconAward size={18} /> BSDC Certificate
          </h1>
        </div>
        <div className="bsdc-flex bsdc-gap-sm">
          <button type="button" className="bsdc-btn bsdc-btn--outline bsdc-btn--sm" onClick={onPrint}>
            <IconDownload size={14} /> Print / PDF
          </button>
          <button type="button" className="bsdc-btn bsdc-btn--outline bsdc-btn--sm" onClick={onDownloadPng}>
            <IconDownload size={14} /> PNG
          </button>
          <button type="button" className="bsdc-btn bsdc-btn--primary bsdc-btn--sm" onClick={onShare}>
            <IconShare size={14} /> Share
          </button>
        </div>
      </div>

      <div ref={containerRef} className="bsdc-certificate bsdc-print-only" style={{
        maxWidth: 840, margin: '0 auto', background: '#fff',
        borderRadius: 12, boxShadow: 'var(--shadow-lg)', overflow: 'hidden'
      }}>
        <CertificateSVG cert={cert} qr={qr} issued={issued} passed={passed} />
      </div>

      <div className="bsdc-card bsdc-text-center bsdc-mt-md" style={{ maxWidth: 840, margin: 'var(--space-md) auto 0' }}>
        <IconQR size={20} color="#1a6b3a" />
        <p className="bsdc-text-sm bsdc-text-muted" style={{ margin: '6px 0 0' }}>
          Anyone can verify this certificate by scanning the QR or opening{' '}
          <Link to={`/certificate/${cert.id}`}>{SITE_URL}/certificate/{cert.id.slice(0, 12)}…</Link>.
        </p>
      </div>
    </>
  );
}

/** Self-contained certificate SVG. */
function CertificateSVG({ cert, qr, issued, passed }) {
  const W = 1600, H = 1130;
  const titleFontSize = (cert.courseTitle || '').length > 50 ? 44 : 56;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ display: 'block', background: '#fff' }}
      role="img"
      aria-label="BSDC Certificate"
    >
      <defs>
        <linearGradient id="cert-border" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a6b3a" />
          <stop offset="100%" stopColor="#0f4a27" />
        </linearGradient>
        <pattern id="cert-bg-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e8f5e9" strokeWidth="0.5" />
        </pattern>
      </defs>

      {/* Background + border */}
      <rect width={W} height={H} fill="#ffffff" />
      <rect width={W} height={H} fill="url(#cert-bg-pattern)" />
      <rect x="40" y="40" width={W - 80} height={H - 80} fill="none" stroke="url(#cert-border)" strokeWidth="12" rx="20" />
      <rect x="80" y="80" width={W - 160} height={H - 160} fill="none" stroke="#1a6b3a" strokeWidth="2" rx="12" />

      {/* Header */}
      <text x={W / 2} y="180" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="32" fontWeight="800" fill="#1a6b3a">
        BANGLADESH SOFTWARE DEVELOPMENT COMMUNITY
      </text>
      <text x={W / 2} y="220" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="16" fill="#555">
        bsdc.info.bd
      </text>

      {/* Title */}
      <text x={W / 2} y="350" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="72" fontWeight="800" fill="#0f4a27">
        Certificate of {passed ? 'Completion' : 'Attempt'}
      </text>
      <line x1={W / 2 - 220} y1="380" x2={W / 2 + 220} y2="380" stroke="#1a6b3a" strokeWidth="3" />

      {/* Awarded-to */}
      <text x={W / 2} y="460" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="22" fill="#555">
        This certificate is proudly awarded to
      </text>
      <text x={W / 2} y="555" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="74" fontWeight="800" fill="#1a6b3a">
        {clip(cert.displayName || cert.username, 30)}
      </text>
      <text x={W / 2} y="600" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="22" fill="#888">
        @{cert.username}
      </text>

      {/* Course */}
      <text x={W / 2} y="680" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="22" fill="#555">
        for {passed ? 'successfully completing' : 'attempting'} the course
      </text>
      <text x={W / 2} y={680 + titleFontSize + 20} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize={titleFontSize} fontWeight="700" fill="#0f4a27">
        {clip(cert.courseTitle, 60)}
      </text>

      {/* Score */}
      <g transform={`translate(${W / 2 - 110}, ${800})`}>
        <rect width="220" height="48" rx="24" fill={passed ? '#1a6b3a' : '#d32f2f'} />
        <text x="110" y="32" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="20" fontWeight="700" fill="#ffffff">
          Score: {cert.score}/{cert.outOf} {passed ? '· PASSED' : '· NOT PASSED'}
        </text>
      </g>

      {/* Signatures + meta */}
      <line x1="200" y1="970" x2="500" y2="970" stroke="#1a6b3a" strokeWidth="2" />
      <text x="350" y="996" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="16" fill="#0f4a27" fontWeight="700">
        Issued on {issued}
      </text>
      <text x="350" y="1018" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="13" fill="#888">
        Date
      </text>

      <line x1={W - 500} y1="970" x2={W - 200} y2="970" stroke="#1a6b3a" strokeWidth="2" />
      <text x={W - 350} y="996" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="16" fill="#0f4a27" fontWeight="700">
        BSDC · Bangladesh Software Development Community
      </text>
      <text x={W - 350} y="1018" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="13" fill="#888">
        Issuing Authority
      </text>

      {/* QR + ID */}
      {qr && (
        <g transform={`translate(${W / 2 - 100}, 870)`}>
          <rect width="200" height="200" fill="none" />
          {/* Placeholder for spacing — we draw the QR below the score, fixed pos */}
        </g>
      )}
      {qr && (
        <g transform={`translate(${W - 280}, 80)`}>
          <rect width="200" height="200" fill="#ffffff" stroke="#1a6b3a" strokeWidth="2" rx="12" />
          <image href={qr} x="10" y="10" width="180" height="180" />
          <text x="100" y="225" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="12" fill="#1a6b3a" fontWeight="700">
            VERIFY THIS CERTIFICATE
          </text>
        </g>
      )}

      {/* Certificate ID */}
      <text x="120" y="170" fontFamily="JetBrains Mono, monospace" fontSize="14" fill="#888">
        Cert ID: {clip(cert.id, 40)}
      </text>
    </svg>
  );
}

function clip(s = '', max) {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}
