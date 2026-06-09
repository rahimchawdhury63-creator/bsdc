/**
 * src/components/notifications/NotificationItem.jsx
 * Single notification row — tap navigates to the relevant URL.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../common/Avatar.jsx';
import { relativeTime } from '../../utils/dateFormatter.js';
import {
  IconUserPlus, IconHeart, IconMessage, IconCoin, IconShield, IconAlert, IconAt, IconLightning
} from '../common/Icons.jsx';

const SITE_PATH = {
  follow:  (n) => `/p/${n.senderUsername}`,
  like:    (n) => n.postSlug ? `/post/${n.postSlug}` : '/',
  comment: (n) => n.postSlug ? `/post/${n.postSlug}` : '/',
  mention: (n) => n.postSlug ? `/post/${n.postSlug}` : `/p/${n.senderUsername}`,
  message: (n) => n.senderId ? `/messages?with=${n.senderId}` : '/messages',
  points:  () => '/points',
  verification: () => '/verify-apply',
  broadcast: () => '/'
};

const ICONS = {
  follow: IconUserPlus, like: IconHeart, comment: IconMessage,
  mention: IconAt, message: IconMessage, points: IconCoin,
  verification: IconShield, broadcast: IconAlert
};

export default function NotificationItem({ notif }) {
  const navigate = useNavigate();
  const Icon = ICONS[notif.type] || IconLightning;
  const url = (SITE_PATH[notif.type] || (() => '/'))(notif);

  return (
    <button
      type="button"
      onClick={() => navigate(url)}
      className="bsdc-flex bsdc-items-center bsdc-gap-sm"
      style={{
        width: '100%', padding: 'var(--space-md)',
        background: notif.isRead ? 'transparent' : 'var(--color-accent)',
        border: 'none', borderBottom: '1px solid var(--color-border)',
        cursor: 'pointer', textAlign: 'left'
      }}
    >
      <Avatar src={notif.senderPhotoURL} name={notif.senderUsername || 'BSDC'} />
      <div className="bsdc-flex-1" style={{ minWidth: 0 }}>
        <div className="bsdc-text-sm">{notif.message}</div>
        <div className="bsdc-text-xs bsdc-text-muted">{relativeTime(notif.createdAt)}</div>
      </div>
      <span
        style={{
          width: 32, height: 32, borderRadius: 16,
          background: 'var(--color-accent)', color: 'var(--color-primary)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
        }}
        aria-hidden="true"
      >
        <Icon size={16} />
      </span>
    </button>
  );
}
