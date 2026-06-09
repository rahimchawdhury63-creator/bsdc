/**
 * src/components/notifications/NotificationBell.jsx
 * Drop-down bell — quick preview of latest 5 + "see all".
 *
 * Used inside Header (replaces the simple icon link when signed in).
 */
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useFirestoreNotifications } from '../../hooks/useNotifications.js';
import NotificationItem from './NotificationItem.jsx';
import { IconBell } from '../common/Icons.jsx';

export default function NotificationBell() {
  const { profile } = useAuth();
  const { items, markAllRead } = useFirestoreNotifications(profile?.uid, 8);
  const unread = items.filter((i) => !i.isRead).length;
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        className="bsdc-icon-btn"
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`}
        onClick={() => { setOpen((v) => !v); if (!open && unread > 0) markAllRead(); }}
      >
        <IconBell />
        {unread > 0 && (
          <span className="bsdc-count-badge" aria-hidden="true">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div
          className="bsdc-card bsdc-card--raised"
          style={{
            position: 'absolute', top: 'calc(100% + 6px)', right: 0,
            width: 360, maxWidth: '92vw',
            maxHeight: 'min(70vh, 520px)', overflowY: 'auto', padding: 0,
            zIndex: 100, animation: 'bsdcFadeIn 140ms ease both'
          }}
          role="menu"
        >
          <div className="bsdc-flex bsdc-items-center bsdc-justify-between bsdc-p-md">
            <strong>Recent</strong>
            <Link to="/notifications" className="bsdc-text-sm" onClick={() => setOpen(false)}>See all</Link>
          </div>
          {items.length === 0 ? (
            <p className="bsdc-text-sm bsdc-text-muted bsdc-text-center" style={{ padding: 24 }}>
              You're all caught up.
            </p>
          ) : items.map((n) => <NotificationItem key={n.id} notif={n} />)}
        </div>
      )}
    </div>
  );
}
