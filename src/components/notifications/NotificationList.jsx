/**
 * src/components/notifications/NotificationList.jsx
 * Full /notifications page list with "mark all read".
 */
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../hooks/useAuth.js';
import { useFirestoreNotifications } from '../../hooks/useNotifications.js';
import { LoadingCenter } from '../common/Spinner.jsx';
import NotificationItem from './NotificationItem.jsx';
import PushNotifSetup from './PushNotifSetup.jsx';
import { IconBell, IconCheck } from '../common/Icons.jsx';

export default function NotificationList() {
  const { profile } = useAuth();
  const { items, loading, markAllRead } = useFirestoreNotifications(profile?.uid, 50);

  return (
    <>
      <Helmet>
        <title>Notifications | BSDC</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="bsdc-flex bsdc-items-center bsdc-justify-between bsdc-mb-md">
        <h1 style={{ margin: 0, fontSize: '1.3rem' }}>
          <IconBell size={20} /> Notifications
        </h1>
        {items.some((i) => !i.isRead) && (
          <button type="button" className="bsdc-btn bsdc-btn--ghost bsdc-btn--sm" onClick={markAllRead}>
            <IconCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      <PushNotifSetup />

      {loading ? (
        <LoadingCenter />
      ) : items.length === 0 ? (
        <div className="bsdc-empty">
          <div className="bsdc-empty__icon"><IconBell /></div>
          <div className="bsdc-empty__title">You're all caught up</div>
          <div className="bsdc-empty__body">New activity will appear here in real time.</div>
        </div>
      ) : (
        <div className="bsdc-card bsdc-card--padless" style={{ overflow: 'hidden' }}>
          {items.map((n) => <NotificationItem key={n.id} notif={n} />)}
        </div>
      )}
    </>
  );
}
