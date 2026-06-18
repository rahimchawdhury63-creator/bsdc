import type { ServiceResult } from '@/types';

/**
 * Client-side OneSignal subscription helper.
 * Sending push notifications is intentionally server-only via Firebase Functions
 * because the OneSignal REST API key must never be exposed in browser code.
 */
export const requestPushPermission = async (): Promise<ServiceResult<true>> => {
  try {
    if (!('Notification' in window)) {
      return { ok: false, error: 'This browser does not support notifications.' };
    }
    const permission = await Notification.requestPermission();
    return permission === 'granted' ? { ok: true, data: true } : { ok: false, error: 'Notification permission was not granted.' };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unable to request push permission.' };
  }
};
