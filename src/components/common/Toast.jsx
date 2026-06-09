/**
 * src/components/common/Toast.jsx
 * ---------------------------------------------------------------------------
 * Tiny global toast system. Mount <ToastHost /> once near the root,
 * then call:
 *
 *   toast.success('Saved!');
 *   toast.error('Something went wrong');
 *   toast.info('Heads up');
 *   toast.warn('Be careful');
 *
 * Implementation uses a module-level subject + React state — no extra
 * dependency, no context spelunking. Tested with rapid-fire toasts.
 * ---------------------------------------------------------------------------
 */

import React, { useEffect, useState, useCallback } from 'react';
import { IconCheck, IconInfo, IconAlert, IconClose } from './Icons.jsx';

// --- subject ---
const listeners = new Set();
let counter = 0;

function emit(toastObj) {
  counter += 1;
  const id = counter;
  const item = { id, duration: 4000, ...toastObj };
  listeners.forEach((cb) => cb({ type: 'add', item }));
  return id;
}

export const toast = {
  success: (msg, opts = {}) => emit({ variant: 'success', title: opts.title, body: msg, ...opts }),
  error:   (msg, opts = {}) => emit({ variant: 'danger',  title: opts.title || 'Error', body: msg, ...opts }),
  warn:    (msg, opts = {}) => emit({ variant: 'warning', title: opts.title, body: msg, ...opts }),
  info:    (msg, opts = {}) => emit({ variant: 'info',    title: opts.title, body: msg, ...opts }),
  dismiss: (id) => listeners.forEach((cb) => cb({ type: 'remove', id }))
};

/** Mount <ToastHost /> ONCE inside the app (Layout / App.jsx). */
export function ToastHost() {
  const [items, setItems] = useState([]);

  // Subscribe to the module-level emitter.
  useEffect(() => {
    const handler = (event) => {
      if (event.type === 'add') {
        setItems((prev) => [...prev, event.item]);
        if (event.item.duration > 0) {
          setTimeout(() => {
            setItems((prev) => prev.filter((t) => t.id !== event.item.id));
          }, event.item.duration);
        }
      } else if (event.type === 'remove') {
        setItems((prev) => prev.filter((t) => t.id !== event.id));
      }
    };
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);

  const dismiss = useCallback((id) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="bsdc-toast-wrap" aria-live="polite" aria-atomic="true">
      {items.map((t) => (
        <div key={t.id} className={`bsdc-toast bsdc-toast--${t.variant}`} role="status">
          <span style={{ color: `var(--color-${t.variant === 'danger' ? 'danger' : t.variant})`, flexShrink: 0 }}>
            {t.variant === 'success' ? <IconCheck size={18} />
              : t.variant === 'danger' ? <IconAlert size={18} />
              : <IconInfo size={18} />}
          </span>
          <div className="bsdc-flex-1">
            {t.title && <div className="bsdc-toast__title">{t.title}</div>}
            <div className="bsdc-toast__body">{t.body}</div>
          </div>
          <button
            type="button"
            className="bsdc-icon-btn bsdc-icon-btn--sm"
            aria-label="Dismiss"
            onClick={() => dismiss(t.id)}
          >
            <IconClose size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
