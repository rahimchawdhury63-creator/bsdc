/**
 * src/components/common/ConfirmDialog.jsx
 * Imperative confirm() replacement.
 *
 *   const ok = await confirmDialog({ title: 'Delete?', body: 'Forever?' });
 *
 * Mount <ConfirmDialogHost /> once near the root.
 */
import React, { useEffect, useState } from 'react';

const listeners = new Set();

export function confirmDialog(opts) {
  return new Promise((resolve) => {
    listeners.forEach((cb) => cb({ ...opts, resolve }));
  });
}

export function ConfirmDialogHost() {
  const [item, setItem] = useState(null);

  useEffect(() => {
    const handler = (i) => setItem(i);
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);

  if (!item) return null;

  const close = (val) => { item.resolve(val); setItem(null); };

  return (
    <div className="bsdc-modal-backdrop" role="dialog" aria-label={item.title} onClick={() => close(false)}>
      <div className="bsdc-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="bsdc-modal__header">
          <h2 className="bsdc-modal__title">{item.title || 'Are you sure?'}</h2>
        </div>
        <div className="bsdc-modal__body">
          <p>{item.body}</p>
        </div>
        <div className="bsdc-modal__footer">
          <button type="button" className="bsdc-btn bsdc-btn--ghost" onClick={() => close(false)}>
            {item.cancelLabel || 'Cancel'}
          </button>
          <button
            type="button"
            className={`bsdc-btn ${item.danger ? 'bsdc-btn--danger' : 'bsdc-btn--primary'}`}
            onClick={() => close(true)}
          >
            {item.confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
