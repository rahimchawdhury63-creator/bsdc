/**
 * src/components/notifications/PushNotifSetup.jsx
 * ---------------------------------------------------------------------------
 * Banner card shown on the notifications page when web push isn't enabled.
 * Wires the current Firebase UID to OneSignal and asks for permission.
 *
 * Hidden if push is already granted or unsupported.
 * ---------------------------------------------------------------------------
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { setupOneSignalForUser } from '../../hooks/useNotifications.js';
import { toast } from '../common/Toast.jsx';
import { IconBell, IconCheck } from '../common/Icons.jsx';

export default function PushNotifSetup() {
  const { profile } = useAuth();
  const [status, setStatus] = useState('unknown'); // unknown | denied | granted | default | unsupported
  const [busy, setBusy] = useState(false);

  // Detect status once on mount + when permission changes.
  useEffect(() => {
    if (typeof Notification === 'undefined') { setStatus('unsupported'); return undefined; }
    setStatus(Notification.permission);
    // Re-check on focus (user may have toggled in browser settings).
    const onFocus = () => setStatus(Notification.permission);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  // Link UID once on profile load.
  useEffect(() => {
    if (profile?.uid) setupOneSignalForUser(profile.uid);
  }, [profile?.uid]);

  if (status === 'granted' || status === 'unsupported') return null;

  const enable = async () => {
    setBusy(true);
    try {
      // OneSignal v16 — request permission via SDK so it also saves the player.
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async (OneSignal) => {
        try {
          await OneSignal.Notifications.requestPermission();
          setStatus(Notification.permission);
          if (Notification.permission === 'granted') {
            if (profile?.uid && OneSignal.login) await OneSignal.login(profile.uid);
            toast.success('Push notifications enabled.');
          }
        } catch (err) {
          toast.error(err?.message || 'Could not enable push.');
        } finally {
          setBusy(false);
        }
      });
    } catch (err) {
      setBusy(false);
      toast.error(err?.message || 'Could not enable push.');
    }
  };

  return (
    <div
      className="bsdc-card bsdc-mb-md bsdc-flex bsdc-items-center bsdc-gap-md"
      style={{ borderLeft: '4px solid var(--color-primary)' }}
    >
      <span className="bsdc-bootstrap__icon" style={{ width: 48, height: 48, marginBottom: 0 }}>
        <IconBell size={22} color="#1a6b3a" />
      </span>
      <div className="bsdc-flex-1">
        <strong>Get notified instantly</strong>
        <p className="bsdc-text-sm bsdc-text-muted" style={{ margin: 0 }}>
          Enable browser push for new likes, messages, and BSDC Points — even when this tab is closed.
        </p>
      </div>
      <button type="button" className="bsdc-btn bsdc-btn--primary bsdc-btn--sm" onClick={enable} disabled={busy}>
        {busy ? 'Enabling…' : <><IconCheck size={14} /> Enable</>}
      </button>
    </div>
  );
}
