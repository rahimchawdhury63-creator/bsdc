/**
 * BSDC OneSignal Push Notifications
 * Client-side web push integration
 */

window.BSDC = window.BSDC || {};

window.BSDC.notifications = {

  initialized: false,

  async init() {
    if (this.initialized) return;
    this.initialized = true;

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async function(OneSignal) {
      try {
        await OneSignal.init({
          appId: "5f367dc9-3fc3-4fd9-b452-e32fa438509b",
          serviceWorkerPath: "/OneSignalSDKWorker.js",
          notifyButton: { enable: false },
          allowLocalhostAsSecureOrigin: true
        });

        // Tag user if logged in
        const user = window.BSDC.auth.currentUser;
        if (user) {
          await OneSignal.login(user.uid);
          const profile = window.BSDC.auth.userProfile;
          if (profile) {
            await OneSignal.User.addTags({
              username: profile.username || '',
              role: profile.role || 'Member'
            });
          }
        }

        // Store permission state
        const permission = await OneSignal.Notifications.permission;
        window.BSDC.notifications.hasPermission = permission;

      } catch(e) {
        console.warn('OneSignal init failed:', e);
      }
    });
  },

  async requestPermission() {
    return new Promise((resolve) => {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async function(OneSignal) {
        try {
          await OneSignal.Notifications.requestPermission();
          const granted = await OneSignal.Notifications.permission;
          resolve(granted);
        } catch(e) {
          resolve(false);
        }
      });
    });
  },

  async sendNotification(userId, title, message, url) {
    // Client-side: We store in Firestore and let the user
    // see it in their notification panel
    try {
      await window.BSDC.db.addNotification(userId, {
        title,
        message,
        url: url || '/',
        type: 'community'
      });
    } catch(e) {
      console.warn('Notification store failed:', e);
    }
  },

  showPromptBanner() {
    if (this.hasPermission) return;
    const existing = document.getElementById('notif-prompt-banner');
    if (existing) return;

    const banner = document.createElement('div');
    banner.id = 'notif-prompt-banner';
    banner.style.cssText = `
      position:fixed;bottom:1.5rem;left:1.5rem;
      background:white;border:1px solid #E2E8F0;
      border-radius:0.75rem;padding:1rem 1.25rem;
      box-shadow:0 10px 30px rgba(0,0,0,0.12);
      max-width:320px;z-index:9000;
      animation:fadeInUp 0.3s ease forwards;
    `;
    banner.innerHTML = `
      <div style="display:flex;align-items:flex-start;gap:0.75rem">
        <span style="font-size:1.5rem;flex-shrink:0">🔔</span>
        <div style="flex:1">
          <p style="font-weight:700;color:#1E293B;font-size:0.9rem;margin-bottom:0.25rem">Stay Updated!</p>
          <p style="color:#64748B;font-size:0.8rem;line-height:1.5;margin-bottom:0.75rem">
            Get notified when someone answers your question or replies to your post.
          </p>
          <div style="display:flex;gap:0.5rem">
            <button id="notif-allow-btn" class="btn btn-primary btn-sm" style="font-size:0.8rem">Allow</button>
            <button id="notif-dismiss-btn" class="btn btn-ghost btn-sm" style="font-size:0.8rem">Not now</button>
          </div>
        </div>
        <button id="notif-close-btn" style="background:none;border:none;cursor:pointer;color:#94A3B8;font-size:1.1rem;padding:0;flex-shrink:0">✕</button>
      </div>
    `;
    document.body.appendChild(banner);

    document.getElementById('notif-allow-btn')?.addEventListener('click', async () => {
      const granted = await this.requestPermission();
      banner.remove();
      if (granted) {
        window.BSDC.toast.success('🔔 Notifications enabled! You\'ll be notified of community updates.');
      }
    });

    document.getElementById('notif-dismiss-btn')?.addEventListener('click', () => banner.remove());
    document.getElementById('notif-close-btn')?.addEventListener('click', () => banner.remove());

    // Auto dismiss after 12s
    setTimeout(() => banner.remove(), 12000);
  }
};
