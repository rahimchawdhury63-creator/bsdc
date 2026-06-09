/**
 * src/pages/Leaderboard.jsx
 * /leaderboard — top BSDC Points earners.
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLeaderboard } from '../firebase/points.js';
import SEOHead from '../components/seo/SEOHead.jsx';
import BreadcrumbSEO from '../components/seo/BreadcrumbSEO.jsx';
import Avatar from '../components/common/Avatar.jsx';
import VerificationBadge from '../components/verification/VerificationBadge.jsx';
import { LoadingCenter } from '../components/common/Spinner.jsx';
import { formatPoints, rankFromPoints } from '../utils/pointsCalculator.js';
import { IconTrophy, IconCoin } from '../components/common/Icons.jsx';

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getLeaderboard(50)
      .then((list) => { if (!cancelled) { setUsers(list); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <SEOHead
        title="Leaderboard"
        description="Top BSDC Point earners — the most active developers in the Bangladesh Software Development Community."
        canonical="/leaderboard"
      />
      <BreadcrumbSEO items={[{ name: 'Home', url: '/' }, { name: 'Leaderboard', url: '/leaderboard' }]} />

      <h1 style={{ margin: 0, fontSize: '1.4rem' }}><IconTrophy size={20} /> BSDC Leaderboard</h1>
      <p className="bsdc-text-muted bsdc-text-sm">Top 50 BSDC Points earners.</p>

      {loading ? <LoadingCenter /> : (
        <div className="bsdc-card bsdc-card--padless bsdc-mt-md">
          {users.map((u, i) => {
            const rank = rankFromPoints(u.bsdcPoints || 0);
            return (
              <Link
                key={u.id}
                to={`/p/${u.username}`}
                className="bsdc-flex bsdc-items-center bsdc-gap-md"
                style={{
                  padding: 'var(--space-md)',
                  borderBottom: '1px solid var(--color-border)',
                  textDecoration: 'none', color: 'inherit'
                }}
              >
                <span style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: i === 0 ? '#d4af37' : i === 1 ? '#a8a8a8' : i === 2 ? '#cd7f32' : 'var(--color-accent)',
                  color: i < 3 ? '#fff' : 'var(--color-primary-dark)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700
                }}>
                  {i + 1}
                </span>
                <Avatar src={u.photoURL} name={u.displayName} />
                <div className="bsdc-flex-1" style={{ minWidth: 0 }}>
                  <div className="bsdc-flex bsdc-items-center bsdc-gap-xs">
                    <strong>{u.displayName || u.username}</strong>
                    {u.isVerified && <VerificationBadge size={12} />}
                    <span className="bsdc-chip" style={{ background: rank.color, color: '#fff', padding: '1px 6px', fontSize: 10 }}>
                      {rank.label}
                    </span>
                  </div>
                  <div className="bsdc-text-xs bsdc-text-muted">@{u.username}</div>
                </div>
                <strong style={{ color: 'var(--color-primary)', whiteSpace: 'nowrap' }}>
                  <IconCoin size={14} /> {formatPoints(u.bsdcPoints || 0)}
                </strong>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
