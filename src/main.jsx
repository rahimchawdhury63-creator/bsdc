/**
 * src/main.jsx
 * ---------------------------------------------------------------------------
 * React entry point. Mounts <App /> into #root and:
 *   - Hides the boot-screen once React is alive
 *   - Wraps the tree in HelmetProvider (so any page can set meta tags)
 *   - Registers the OneSignal Web SDK (push notifications)
 *
 * NOTE: Full <App /> routing arrives in Response 8 (SEO module). For now
 * we render a lightweight bootstrap that confirms Firebase + styles work.
 * ---------------------------------------------------------------------------
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';

// Style entrypoint — pulls in reset, variables, layout, components, etc.
import './styles/main.css';

import App from './App.jsx';
import { initLazyLoad } from './scripts/lazyLoad.js';

/**
 * Remove the static boot screen the moment React renders.
 * The boot screen prevents flash-of-unstyled-content on slow connections.
 */
function hideBootScreen() {
  const el = document.getElementById('bsdc-boot-screen');
  if (el) {
    el.style.opacity = '0';
    el.style.transition = 'opacity 240ms ease';
    setTimeout(() => el.remove(), 260);
  }
}

/**
 * Lazily load OneSignal so it never blocks the main thread.
 * App ID is read from env. Initialization is idempotent.
 */
function bootOneSignal() {
  const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
  if (!appId) return;

  // Inject the SDK script tag only once.
  if (!document.getElementById('onesignal-sdk')) {
    const s = document.createElement('script');
    s.id = 'onesignal-sdk';
    s.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
    s.defer = true;
    document.head.appendChild(s);
  }

  // OneSignal v16 uses a queue pattern.
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OneSignal) => {
    try {
      await OneSignal.init({
        appId,
        allowLocalhostAsSecureOrigin: true,
        serviceWorkerPath: '/OneSignalSDKWorker.js',
        notifyButton: { enable: false }
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[BSDC] OneSignal init failed:', err);
    }
  });
}

// ---- mount ----
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);

// ---- post-mount side effects ----
hideBootScreen();
bootOneSignal();
initLazyLoad();
