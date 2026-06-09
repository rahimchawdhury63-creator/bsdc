/**
 * src/admin/AnalyticsPanel.jsx
 * Per-day signups / posts over the last 14 days (computed client-side).
 */
import React, { useEffect, useState } from 'react';
import {
  collection, query, orderBy, limit, getDocs, where
} from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { LoadingCenter } from '../components/common/Spinner.jsx';
import { toDate } from '../utils/dateFormatter.js';
import { formatPoints } from '../utils/pointsCalculator.js';
import { IconTrending, IconUsers, IconBookOpen, IconCoin } from '../components/common/Icons.jsx';

const DAYS = 14;

function bucketByDay(items, getDate) {
  const out = new Map();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    out.set(d.toISOString().slice(0, 10), 0);
  }
  items.forEach((it) => {
    const d = getDate(it);
    if (!d) return;
    const key = d.toISOString().slice(0, 10);
    if (out.has(key)) out.set(key, out.get(key) + 1);
  });
  return [...out.entries()];
}

export default function AnalyticsPanel() {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      const since = new Date(Date.now() - DAYS * 86400000);
      try {
        const [usersSnap, postsSnap, txSnap] = await Promise.all([
          getDocs(query(collection(db, 'users'), where('createdAt', '>=', since), orderBy('createdAt', 'asc'), limit(2000))),
          getDocs(query(collection(db, 'posts'), where('createdAt', '>=', since), orderBy('createdAt', 'asc'), limit(5000))),
          getDocs(query(collection(db, 'pointsTransactions'), where('createdAt', '>=', since), orderBy('createdAt', 'asc'), limit(5000)))
        ]);
        const users = usersSnap.docs.map((d) => d.data());
        const posts = postsSnap.docs.map((d) => d.data());
        const txs = txSnap.docs.map((d) => d.data());
        setData({
          users: bucketByDay(users, (u) => toDate(u.createdAt)),
          posts: bucketByDay(posts, (p) => toDate(p.createdAt)),
          points: txs.reduce((s, t) => s + (t.amount || 0), 0)
        });
      } catch {
        setData({ users: [], posts: [], points: 0 });
      }
    })();
  }, []);

  if (!data) return <LoadingCenter />;

  return (
    <>
      <h1 style={{ marginTop: 0, fontSize: '1.3rem' }}>
        <IconTrending size={18} /> Analytics (last {DAYS} days)
      </h1>

      <div className="bsdc-grid-2">
        <Chart title="New signups" Icon={IconUsers} data={data.users} accent="#1a6b3a" />
        <Chart title="New posts"   Icon={IconBookOpen} data={data.posts} accent="#0277bd" />
      </div>

      <div className="bsdc-card bsdc-mt-md">
        <div className="bsdc-flex bsdc-items-center bsdc-gap-sm">
          <IconCoin size={18} color="#1a6b3a" />
          <strong>BSDC Points circulated this period:</strong>
          <span className="bsdc-text-bold">{formatPoints(data.points)}</span>
        </div>
      </div>
    </>
  );
}

/** Simple bar chart with inline SVG — no charting library. */
function Chart({ title, Icon, data, accent }) {
  const max = Math.max(1, ...data.map(([, v]) => v));
  const W = 600, H = 180, P = 24;
  const bw = (W - P * 2) / Math.max(data.length, 1);
  return (
    <div className="bsdc-card">
      <h3 style={{ margin: 0, fontSize: '1rem' }}>
        <Icon size={14} /> {title}
      </h3>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={title}>
        <line x1={P} y1={H - P} x2={W - P} y2={H - P} stroke="#e0e6e2" />
        {data.map(([label, value], i) => {
          const x = P + i * bw + 4;
          const h = ((H - P * 2) * value) / max;
          const y = H - P - h;
          return (
            <g key={label}>
              <rect x={x} y={y} width={bw - 8} height={h} fill={accent} opacity={0.85} rx={3}>
                <title>{label}: {value}</title>
              </rect>
              {i % 2 === 0 && (
                <text x={x + (bw - 8) / 2} y={H - 8} fontSize="9" textAnchor="middle" fill="#888">
                  {label.slice(5)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="bsdc-text-xs bsdc-text-muted bsdc-text-right">
        Total: {data.reduce((s, [, v]) => s + v, 0)}
      </div>
    </div>
  );
}
