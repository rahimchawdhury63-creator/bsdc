import { PUBLIC_INTEGRATIONS } from './constants';

/**
 * Initializes OneSignal after the external SDK has loaded from index.html.
 * The function is idempotent and safe to call from React effects. REST API keys
 * are intentionally excluded because push sending must happen in Cloud Functions.
 */
export const initializeOneSignal = (): void => {
  if (typeof window === 'undefined' || !PUBLIC_INTEGRATIONS.oneSignalAppId) {
    return;
  }

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OneSignal) => {
    await OneSignal.init({
      appId: PUBLIC_INTEGRATIONS.oneSignalAppId,
      allowLocalhostAsSecureOrigin: true,
      notifyButton: { enable: false },
      serviceWorkerParam: { scope: '/' },
      serviceWorkerPath: 'OneSignalSDKWorker.js'
    });
  });
};
