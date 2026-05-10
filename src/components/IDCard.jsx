import React, { useEffect, useRef, useState } from 'react';

const BSDCLogoCard = () => (
  <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
    <rect width="36" height="36" rx="6" fill="#006A4E"/>
    <text x="4" y="26" fontFamily="Inter,sans-serif" fontSize="18" fontWeight="900" fill="white">BS</text>
    <rect x="0" y="30" width="36" height="6" fill="#004d38"/>
    <text x="3" y="35" fontFamily="Inter,sans-serif" fontSize="7" fontWeight="700" fill="#6EE7B7" letterSpacing="1">DC.BD</text>
  </svg>
);

const LocationIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#6EE7B7">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

function generateQR(canvas, url) {
  if (!canvas) return;
  const QRCode = window.QRCode;
  if (!QRCode) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    script.onload = () => {
      new window.QRCode(canvas, {
        text: url,
        width: 80,
        height: 80,
        colorDark: '#006A4E',
        colorLight: '#ffffff',
        correctLevel: window.QRCode.CorrectLevel.M,
      });
    };
    document.head.appendChild(script);
    return;
  }
  new QRCode(canvas, {
    text: url,
    width: 80,
    height: 80,
    colorDark: '#006A4E',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.M,
  });
}

function getMemberNumber(uid) {
  if (!uid) return 'BSDC-000000';
  const hash = uid.replace(/[^0-9]/g, '').slice(0, 6).padStart(6, '0');
  return `BSDC-${hash}`;
}

export default function IDCard({ profile, uid }) {
  const qrRef = useRef(null);
  const qrRendered = useRef(false);
  const profileUrl = `https://www.bsdc.info.bd/profile/${uid}`;
  const [copied, setCopied] = useState(false);
  const memberNum = getMemberNumber(uid);
  const joinYear = profile?.joinedAt?.toDate
    ? profile.joinedAt.toDate().getFullYear()
    : new Date().getFullYear();

  useEffect(() => {
    if (qrRef.current && !qrRendered.current) {
      qrRendered.current = true;
      generateQR(qrRef.current, profileUrl);
    }
  }, [profileUrl]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.displayName} — BSDC Developer Profile`,
          text: `Check out ${profile?.displayName}'s developer profile on BSDC!`,
          url: profileUrl,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = () => {
    const card = document.getElementById('bsdc-id-card');
    if (!card) return;
    const html2canvas = window.html2canvas;
    if (!html2canvas) {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      s.onload = () => doDownload();
      document.head.appendChild(s);
      return;
    }
    doDownload();
  };

  const doDownload = () => {
    window.html2canvas(document.getElementById('bsdc-id-card'), { scale: 2 }).then(canvas => {
      const link = document.createElement('a');
      link.download = `BSDC-${profile?.displayName?.replace(/\s+/g, '-')}-ID.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  return (
    <div>
      <div id="bsdc-id-card" className="id-card" role="region" aria-label={`${profile?.displayName} BSDC Developer ID Card`}>
        {/* Top stripe */}
        <div className="id-card-org">
          <BSDCLogoCard />
          <div>
            <div className="id-card-org-name">Bangladesh Software Development Community</div>
            <div style={{ fontSize: '0.6rem', color: '#475569', fontFamily: 'var(--font-mono)' }}>
              OFFICIAL DEVELOPER MEMBER CARD
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <div style={{ display: 'flex', gap: 3 }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ width: 6, height: 20, background: i === 0 ? '#006A4E' : i === 1 ? '#00855f' : '#6EE7B7', borderRadius: 2 }} />
              ))}
            </div>
          </div>
        </div>

        {/* Avatar + Info */}
        <div className="id-card-body">
          {profile?.photoURL ? (
            <img
              src={profile.photoURL}
              alt={profile.displayName}
              className="id-card-avatar"
              loading="lazy"
            />
          ) : (
            <div className="id-card-avatar" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 800, color: '#6EE7B7',
              background: 'linear-gradient(135deg, #004d38, #006A4E)',
            }}>
              {profile?.displayName?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <div className="id-card-info">
            <div className="id-card-name">{profile?.displayName || 'Developer'}</div>
            <div className="id-card-role">
              {profile?.role === 'admin' ? '⚡ Admin' : profile?.role === 'moderator' ? '🛡️ Moderator' : '💻 Developer'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
              <LocationIcon />
              <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                {profile?.location || 'Bangladesh'} 🇧🇩
              </span>
            </div>
            <div className="id-card-uid">{memberNum}</div>
            <div className="id-card-skills">
              {(profile?.skills || []).slice(0, 4).map(skill => (
                <span key={skill} className="id-card-skill">{skill}</span>
              ))}
              {(!profile?.skills || profile.skills.length === 0) && (
                <span className="id-card-skill">Developer</span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="id-card-stats">
          <div>
            <div className="id-card-stat-num">{profile?.postCount || 0}</div>
            <div className="id-card-stat-label">Posts</div>
          </div>
          <div>
            <div className="id-card-stat-num">{profile?.reputation || 0}</div>
            <div className="id-card-stat-label">Reputation</div>
          </div>
          <div>
            <div className="id-card-stat-num">{joinYear}</div>
            <div className="id-card-stat-label">Joined</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
            <StarIcon />
            <span style={{ fontSize: '0.75rem', color: '#6EE7B7', fontWeight: 700 }}>VERIFIED</span>
          </div>
        </div>

        {/* Footer: QR + Barcode */}
        <div className="id-card-footer">
          <div>
            <div style={{ fontSize: '0.6rem', color: '#64748B', marginBottom: 4, fontFamily: 'var(--font-mono)' }}>
              SCAN TO VIEW PROFILE
            </div>
            <div className="id-card-qr">
              <div ref={qrRef} style={{ width: 80, height: 80 }} aria-label={`QR code for ${profile?.displayName}'s profile`} />
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.6rem', color: '#475569', marginBottom: 4 }}>
              bsdc.info.bd
            </div>
            <div className="id-card-barcode">
              {memberNum.replace('-', '|')}
            </div>
            <div style={{ marginTop: 8, fontSize: '0.65rem', color: '#334155' }}>
              Member since {joinYear}
            </div>
            <div style={{ marginTop: 4 }}>
              <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                {[...Array(12)].map((_, i) => (
                  <div key={i} style={{
                    width: i % 3 === 0 ? 3 : 1,
                    height: 20,
                    background: '#334155',
                    borderRadius: 1,
                  }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="id-card-actions" style={{ justifyContent: 'center' }}>
        <button className="btn btn-outline btn-sm" onClick={handleShare}>
          {copied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              Share Profile
            </>
          )}
        </button>
        <button className="btn btn-dark btn-sm" onClick={handleDownload}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download Card
        </button>
      </div>
    </div>
  );
}
