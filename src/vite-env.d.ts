/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

/**
 * Defines browser globals loaded by the OneSignal Web SDK before React starts.
 * The SDK is intentionally kept outside the bundle so Cloudflare Pages can cache
 * the application bundle separately from the vendor-managed notification script.
 */
interface Window {
  OneSignalDeferred?: Array<(oneSignal: OneSignalBrowserSdk) => Promise<void> | void>;
}

/** Minimal strongly typed surface used by this project for OneSignal setup. */
interface OneSignalBrowserSdk {
  init(options: {
    appId: string;
    allowLocalhostAsSecureOrigin?: boolean;
    notifyButton?: { enable: boolean };
    serviceWorkerParam?: { scope: string };
    serviceWorkerPath?: string;
  }): Promise<void>;
  login?(externalId: string): Promise<void>;
  logout?(): Promise<void>;
}
