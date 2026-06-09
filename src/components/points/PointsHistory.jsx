/**
 * src/components/points/PointsHistory.jsx
 * Last 30 transactions touching the current user.
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listMyTransactions } from '../../firebase/points.js';
import { LoadingCenter } from '../common/Spinner.jsx';
import { relativeTime } from '../../utils/dateFormatter.js';
import { formatPoints } from '../../utils/pointsCalculator.js';
import { IconCoin, IconForward, IconBack, IconAward, IconLightning } from '../common/Icons.jsx';

export default function PointsHistory({ uid }) {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    setLoading(true);
    listMyTransactions(uid, 30)
      .then((list) => { if (!cancelled) setTxs(list); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [uid]);

  if (loading) return <LoadingCenter />;

  if (txs.length === 0) {
    return (
      <div className="bsdc-empty">
        <div className="bsdc-empty__title">No transactions yet</div>
        <div className="bsdc-empty__body">
          Earn points by posting, getting likes, commenting, or daily login.
        </div>
      </div>
    );
  }

  return (
    <div className="bsdc-card bsdc-card--padless">
      {txs.map((t) => {
        const isIncoming = t.toUserId === uid;
        const amount = (isIncoming ? '+' : '−') + formatPoints(t.amount || 0);
        const color = isIncoming ? 'var(--color-success)' : 'var(--color-danger)';
        return (
          <div
            key={t.id}
            className="bsdc-flex bsdc-items-center bsdc-gap-sm"
            style={{ padding: 'var(--space-md)', borderBottom: '1px solid var(--color-border)' }}
          >
            <span
              className="bsdc-bootstrap__icon"
              style={{ width: 36, height: 36, marginBottom: 0, color }}
            >
              {t.type === 'bonus' ? <IconAward size={18} />
                : t.type === 'transfer' ? (isIncoming ? <IconBack size={18} /> : <IconForward size={18} />)
                : t.type === 'spend' ? <IconForward size={18} />
                : <IconLightning size={18} />}
            </span>
            <div className="bsdc-flex-1" style={{ minWidth: 0 }}>
              <div className="bsdc-text-sm">{labelFor(t, uid)}</div>
              <div className="bsdc-text-xs bsdc-text-muted">{relativeTime(t.createdAt)}</div>
            </div>
            <strong style={{ color, whiteSpace: 'nowrap' }}>
              <IconCoin size={14} /> {amount}
            </strong>
          </div>
        );
      })}
    </div>
  );
}

function labelFor(t, uid) {
  const isIncoming = t.toUserId === uid;
  const other = isIncoming ? t.fromUserId : t.toUserId;
  switch (t.type) {
    case 'transfer':
      return isIncoming
        ? <>From <Link to={`/p/${other}`}>@{other.slice(0, 12)}</Link>{t.reason ? ` · ${t.reason}` : ''}</>
        : <>To <Link to={`/p/${other}`}>@{other.slice(0, 12)}</Link>{t.reason ? ` · ${t.reason}` : ''}</>;
    case 'bonus': return t.reason || 'Bonus';
    case 'earn':  return t.reason || 'Earned';
    case 'spend': return t.reason || 'Spent';
    default:      return t.reason || t.type;
  }
}
