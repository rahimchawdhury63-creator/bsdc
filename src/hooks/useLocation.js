/**
 * src/hooks/useLocation.js
 * ---------------------------------------------------------------------------
 * Browser geolocation hook — FREE (no third-party API).
 *
 *   const { coords, loading, error, request } = useLocation();
 *
 * Coords are cached in sessionStorage so subsequent renders don't re-prompt.
 * The user must initiate via request() — we never auto-prompt on mount.
 * ---------------------------------------------------------------------------
 */

import { useState, useCallback } from 'react';

const STORAGE_KEY = 'bsdc.geo.v1';

/** Read cached coords (≤30 minutes old). */
function readCached() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { lat, lng, ts } = JSON.parse(raw);
    if (Date.now() - ts > 30 * 60 * 1000) return null;
    return { lat, lng };
  } catch { return null; }
}

export default function useLocation() {
  const [coords, setCoords] = useState(() => readCached());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const err = new Error('Geolocation not supported.');
        setError(err); reject(err); return;
      }
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...c, ts: Date.now() }));
          setCoords(c);
          setLoading(false);
          resolve(c);
        },
        (err) => {
          setError(err);
          setLoading(false);
          reject(err);
        },
        { maximumAge: 30 * 60 * 1000, timeout: 10000, enableHighAccuracy: false }
      );
    });
  }, []);

  return { coords, loading, error, request };
}
