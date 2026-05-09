// ============================================
// BSDC — OneSignal Push Notifications Manager
// ============================================

import { db, auth, showToast } from './firebase-init.js';
import { doc, updateDoc, collection, addDoc, serverTimestamp, getDocs, query, where, orderBy, limit, updateDoc as fsUpdateDoc } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

const ONESIGNAL_APP_ID = '5f367dc9-3fc3-4fd9-b452-e32fa438509b';
const ONESIGNAL_REST_KEY = 'os_v2_app_l43h3sj7ynh5tncs4mx2iocqto3b6mwxzsveg757vabiubapfavrm6gny2x6ff6ehqi3hszcgtngkonkrlf5ihdq54gmnj2kp7ojita';

// ── Init OneSignal and link user ──
export async function initNotifications(userId) {
  if (!window.OneSignalDeferred) return;

  window.OneSignalDeferred.push(async function(OneSignal) {
    try {
      // Request permission
      await OneSignal.Notifications.requestPermission();

      // Get player ID (subscription ID)
      const playerId = await OneSignal.User.PushSubscription.id;

      if (playerId && userId) {
        // Link OneSignal player ID to Firebase user
        await updateDoc(doc(db, 'users', userId), {
          oneSignalId: playerId
        });

        // Set external user ID in OneSignal
        await OneSignal.login(userId);
      }

    } catch(err) {
      console.warn('BSDC Notifications: Permission not granted or error:', err);
    }
  });
}

// ── Send push notification to specific user ──
export async function sendNotificationToUser(targetUserId, title, message, url) {
  try {
    // Get user's OneSignal ID from Firestore
    const { getDoc } = await import("https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js");
    const userSnap = await getDoc(doc(db, 'users', targetUserId));
    if (!userSnap.exists()) return;

    const userData = userSnap.data();
    const oneSignalId = userData.oneSignalId;

    if (!oneSignalId) return;

    const payload = {
      app_id: ONESIGNAL_APP_ID,
      include_subscription_ids: [oneSignalId],
      headings: { en: title },
      contents: { en: message },
      url: url || 'https://www.bsdc.info.bd',
      web_url: url || 'https://www.bsdc.info.bd',
      chrome_web_icon: 'https://www.bsdc.info.bd/assets/img/favicon.ico',
      small_icon: 'https://www.bsdc.info.bd/assets/img/favicon.ico'
    };

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${ONESIGNAL_REST_KEY}`
      },
      body: JSON.stringify(payload)
    });

    return response.ok;
  } catch(err) {
    console.error('Notification send error:', err);
    return false;
  }
}

// ── Send notification to all subscribers (admin) ──
export async function broadcastNotification(title, message, url) {
  const payload = {
    app_id: ONESIGNAL_APP_ID,
    included_segments: ['All'],
    headings: { en: title },
    contents: { en: message },
    url: url || 'https://www.bsdc.info.bd',
    web_url: url || 'https://www.bsdc.info.bd',
    chrome_web_icon: 'https://www.bsdc.info.bd/assets/img/favicon.ico'
  };

  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Key ${ONESIGNAL_REST_KEY}`
    },
    body: JSON.stringify(payload)
  });

  return response.ok;
}

// ── Store in-app notification in Firestore ──
export async function createInAppNotification(targetUserId, type, message, link, fromUserId, fromUserName) {
  try {
    await addDoc(collection(db, `users/${targetUserId}/notifications`), {
      type,
      message,
      link,
      fromUserId: fromUserId || null,
      fromUserName: fromUserName || null,
      isRead: false,
      createdAt: serverTimestamp()
    });
  } catch(err) {
    console.error('In-app notification error:', err);
  }
}

// ── Load in-app notifications for navbar ──
export async function loadInAppNotifications(userId) {
  const badge = document.getElementById('notif-badge');
  if (!badge) return;

  try {
    const snap = await getDocs(query(
      collection(db, `users/${userId}/notifications`),
      where('isRead', '==', false),
      orderBy('createdAt', 'desc'),
      limit(20)
    ));

    const count = snap.size;
    if (count > 0) {
      badge.textContent = count > 9 ? '9+' : count;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }

    // Click to view notifications
    const notifBtn = document.getElementById('nav-notifications');
    if (notifBtn) {
      notifBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showNotificationsPanel(snap.docs.map(d => ({ id: d.id, ...d.data() })), userId);
      });
    }
  } catch(err) {
    console.error('Load notifications error:', err);
  }
}

// ── Notifications Panel ──
function showNotificationsPanel(notifications, userId) {
  let panel = document.getElementById('notif-panel');
  if (panel) { panel.remove(); return; }

  panel = document.createElement('div');
  panel.id = 'notif-panel';
  panel.style.cssText = `
    position:fixed;top:70px;right:20px;z-index:9000;
    background:#fff;border:1px solid #E2E8F0;border-radius:16px;
    box-shadow:0 20px 40px rgba(0,0,0,0.15);width:340px;max-height:480px;
    overflow-y:auto;
  `;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Notifications');

  const header = `
    <div style="padding:16px 20px;border-bottom:1px solid #E2E8F0;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:#fff;z-index:1;">
      <strong style="font-size:0.925rem;color:#1E293B;">Notifications</strong>
      <button onclick="document.getElementById('notif-panel').remove()" style="background:none;border:none;cursor:pointer;color:#64748B;font-size:1.2rem;" aria-label="Close notifications">×</button>
    </div>
  `;

  const items = notifications.length > 0
    ? notifications.map(n => `
        <div style="padding:14px 20px;border-bottom:1px solid #F1F5F9;background:${n.isRead ? '#fff' : '#F0FDF4'};"
          onclick="markNotifRead('${n.id}', '${userId}', '${n.link || '/'}')" style="cursor:pointer;">
          <div style="font-size:0.825rem;color:#1E293B;line-height:1.5;margin-bottom:4px;">${n.message}</div>
          <div style="font-size:0.75rem;color:#94A3B8;">${n.fromUserName ? `From ${n.fromUserName} · ` : ''}${n.createdAt?.toDate ? new Date(n.createdAt.toDate()).toLocaleDateString() : 'Recently'}</div>
        </div>
      `).join('')
    : '<div style="padding:32px;text-align:center;color:#94A3B8;font-size:0.875rem;">No notifications yet</div>';

  panel.innerHTML = header + items;
  document.body.appendChild(panel);

  document.addEventListener('click', function handler(e) {
    if (!panel.contains(e.target) && e.target.id !== 'nav-notifications') {
      panel.remove();
      document.removeEventListener('click', handler);
    }
  });
}

// ── Mark notification as read ──
window.markNotifRead = async function(notifId, userId, link) {
  try {
    const { doc: fsDoc, updateDoc: fsUpdate } = await import("https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js");
    await fsUpdate(fsDoc(db, `users/${userId}/notifications/${notifId}`), { isRead: true });
  } catch(e) {}
  if (link && link !== '/') window.location.href = link;
};

// ── Auto-init on auth ──
onAuthStateChanged(auth, (user) => {
  if (user) {
    initNotifications(user.uid);
    loadInAppNotifications(user.uid);
  }
});
