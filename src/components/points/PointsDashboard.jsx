/**
 * src/components/points/PointsDashboard.jsx
 * ---------------------------------------------------------------------------
 * /points main view — tabs: Overview | Transfer | Receive | History | How to earn
 * ---------------------------------------------------------------------------
 */

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../hooks/useAuth.js';
import useBSDCPoints from '../../hooks/useBSDCPoints.js';
import { formatPoints, RANKS, POINTS_RULES } from '../../utils/pointsCalculator.js';
import PointsTransfer from './PointsTransfer.jsx';
import PointsHistory from './PointsHistory.jsx';
import QRCodeTransfer from './QRCodeTransfer.jsx';
import { Link } from 'react-router-dom';
import {
  IconCoin, IconSend, IconQR, IconClock, IconAward, IconTrophy
} from '../common/Icons.jsx';

const TABS = [
  { id: 'overview', label: 'Overview', Icon: IconCoin },
  { id: 'send',     label: 'Send',     Icon: IconSend },
  { id: 'receive',  label: 'Receive',  Icon: IconQR },
  { id: 'history',  label: 'History',  Icon: IconClock },
  { id: 'earn',     label: 'How to earn', Icon: IconAward }
];

export default function PointsDashboard() {
  const { profile } = useAuth();
  const { balance, rank, progress } = useBSDCPoints();
  const [tab, setTab] = useState('overview');

  if (!profile) {
    return (
      <div className="bsdc-empty">
        <div className="bsdc-empty__title">Sign in to view your BSDC Points</div>
        <Link to="/login" className="bsdc-btn bsdc-btn--primary bsdc-mt-md">Sign in</Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>BSDC Points | Bangladesh Software Development Community</title>
        <meta name="description" content="Earn, transfer, and spend BSDC Points — the community currency of the Bangladesh Software Development Community." />
        <link rel="canonical" href="https://www.bsdc.info.bd/points" />
      </Helmet>

      {/* Hero balance card */}
      <div
        className="bsdc-card"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
          color: '#fff', marginBottom: 'var(--space-md)'
        }}
      >
        <div className="bsdc-flex bsdc-items-center bsdc-justify-between bsdc-flex-wrap bsdc-gap-md">
          <div>
            <div style={{ opacity: 0.8, fontSize: '0.85rem' }}>Current balance</div>
            <div style={{ fontSize: 'clamp(2rem, 6vw, 2.6rem)', fontWeight: 800 }}>
              <IconCoin size={32} /> {formatPoints(balance)} <small style={{ fontSize: '1rem', opacity: 0.8 }}>BSDC</small>
            </div>
            <div className="bsdc-flex bsdc-items-center bsdc-gap-xs" style={{ opacity: 0.92 }}>
              <IconTrophy size={16} /> {rank.label} rank
            </div>
          </div>
          <div style={{ minWidth: 200, maxWidth: 280, flex: 1 }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.85, marginBottom: 4 }}>
              Progress to next rank
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.25)', borderRadius: 4 }}>
              <div style={{
                width: `${progress * 100}%`, height: '100%',
                background: '#fff', borderRadius: 4, transition: 'width 300ms ease'
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bsdc-tabs">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={`bsdc-tab ${tab === id ? 'bsdc-tab--active' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      <div className="bsdc-mt-md">
        {tab === 'overview' && <Overview profile={profile} />}
        {tab === 'send' && <PointsTransfer />}
        {tab === 'receive' && (
          <QRCodeTransfer uid={profile.uid} username={profile.username} />
        )}
        {tab === 'history' && <PointsHistory uid={profile.uid} />}
        {tab === 'earn' && <EarnGuide />}
      </div>
    </>
  );
}

function Overview({ profile }) {
  return (
    <div className="bsdc-grid-2">
      <div className="bsdc-card">
        <h3 style={{ margin: 0, fontSize: '1rem' }}><IconTrophy size={16} /> Rank ladder</h3>
        <p className="bsdc-text-muted bsdc-text-sm">Climb by earning BSDC Points.</p>
        {RANKS.map((r) => {
          const reached = (profile.bsdcPoints || 0) >= r.min;
          return (
            <div
              key={r.id}
              className="bsdc-flex bsdc-items-center bsdc-gap-sm"
              style={{ padding: '8px 0', opacity: reached ? 1 : 0.55 }}
            >
              <span style={{
                width: 28, height: 28, borderRadius: '50%',
                background: r.color, color: '#fff',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700
              }}>{r.label[0]}</span>
              <strong style={{ flex: 1 }}>{r.label}</strong>
              <span className="bsdc-text-xs bsdc-text-muted">{r.min.toLocaleString()} pts</span>
            </div>
          );
        })}
      </div>

      <div className="bsdc-card">
        <h3 style={{ margin: 0, fontSize: '1rem' }}><IconAward size={16} /> Quick stats</h3>
        <div className="bsdc-flex bsdc-justify-between" style={{ padding: '8px 0' }}>
          <span className="bsdc-text-muted">Followers</span>
          <strong>{profile.followers || 0}</strong>
        </div>
        <div className="bsdc-flex bsdc-justify-between" style={{ padding: '8px 0' }}>
          <span className="bsdc-text-muted">Posts</span>
          <strong>{profile.postsCount || 0}</strong>
        </div>
        <div className="bsdc-flex bsdc-justify-between" style={{ padding: '8px 0' }}>
          <span className="bsdc-text-muted">Verified</span>
          <strong>{profile.isVerified ? 'Yes' : 'No'}</strong>
        </div>
      </div>
    </div>
  );
}

function EarnGuide() {
  const items = [
    { label: 'Publish a post',           amount: POINTS_RULES.post },
    { label: 'Receive a like on a post', amount: POINTS_RULES.like },
    { label: 'Comment on a post',        amount: POINTS_RULES.comment },
    { label: 'Gain a follower',          amount: POINTS_RULES.follower },
    { label: 'Daily login bonus',        amount: POINTS_RULES.dailyLogin },
    { label: 'Complete a course',        amount: POINTS_RULES.courseComplete },
    { label: 'Get verified',             amount: POINTS_RULES.verified }
  ];
  return (
    <div className="bsdc-card bsdc-card--padless">
      <div className="bsdc-p-md" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <strong>How to earn BSDC Points</strong>
      </div>
      {items.map((it) => (
        <div
          key={it.label}
          className="bsdc-flex bsdc-justify-between bsdc-items-center"
          style={{ padding: 'var(--space-md)', borderBottom: '1px solid var(--color-border)' }}
        >
          <span>{it.label}</span>
          <strong style={{ color: 'var(--color-primary)' }}>
            <IconCoin size={14} /> +{it.amount}
          </strong>
        </div>
      ))}
      <div className="bsdc-p-md bsdc-text-xs bsdc-text-muted">
        Tip: posts earn extra when they go viral — likes scale automatically.
      </div>
    </div>
  );
}
