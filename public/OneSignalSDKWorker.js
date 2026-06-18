/*
 * OneSignal service worker bridge.
 * The worker must live at the public root so the OneSignal SDK can register it
 * with root scope on Cloudflare Pages and deliver web push notifications.
 */
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');
