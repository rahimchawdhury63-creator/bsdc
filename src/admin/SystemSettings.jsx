/**
 * src/admin/SystemSettings.jsx
 * Global flags (maintenance mode, registration on/off, post approval, limits).
 */
import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config.js';
import Spinner from '../components/common/Spinner.jsx';
import { toast } from '../components/common/Toast.jsx';
import { IconSettings, IconCheck } from '../components/common/Icons.jsx';

const DEFAULTS = {
  maintenanceMode: false,
  registrationEnabled: true,
  emailVerificationRequired: true,
  postApprovalRequired: false,
  maxImagesPerPost: 10,
  maxVideoSizeMB: 100,
  minPointsForAd: 100,
  featuredPostPoints: 50
};

export default function SystemSettings() {
  const [s, setS] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'systemSettings', 'global'))
      .then((d) => { if (d.exists()) setS({ ...DEFAULTS, ...d.data() }); })
      .catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'systemSettings', 'global'), { ...s, updatedAt: serverTimestamp() }, { merge: true });
      toast.success('System settings saved.');
    } catch (err) { toast.error(err?.message || 'Save failed.'); }
    finally { setSaving(false); }
  };

  return (
    <>
      <h1 style={{ marginTop: 0, fontSize: '1.3rem' }}><IconSettings size={18} /> System</h1>
      <div className="bsdc-card" style={{ maxWidth: 640 }}>
        <Toggle label="Maintenance mode" hint="When on, only admins can access the site." value={s.maintenanceMode} onChange={(v) => setS({ ...s, maintenanceMode: v })} />
        <Toggle label="Registration enabled" value={s.registrationEnabled} onChange={(v) => setS({ ...s, registrationEnabled: v })} />
        <Toggle label="Email verification required" value={s.emailVerificationRequired} onChange={(v) => setS({ ...s, emailVerificationRequired: v })} />
        <Toggle label="Post approval required (every new post hidden until admin OK)" value={s.postApprovalRequired} onChange={(v) => setS({ ...s, postApprovalRequired: v })} />

        <NumField label="Max images per post" value={s.maxImagesPerPost} onChange={(v) => setS({ ...s, maxImagesPerPost: v })} />
        <NumField label="Max video size (MB)"  value={s.maxVideoSizeMB}    onChange={(v) => setS({ ...s, maxVideoSizeMB: v })} />
        <NumField label="Minimum BSDC Points to create an ad" value={s.minPointsForAd} onChange={(v) => setS({ ...s, minPointsForAd: v })} />
        <NumField label="Points cost to feature a post" value={s.featuredPostPoints} onChange={(v) => setS({ ...s, featuredPostPoints: v })} />

        <button type="button" className="bsdc-btn bsdc-btn--primary bsdc-mt-md" onClick={save} disabled={saving}>
          {saving ? <Spinner size="sm" /> : <IconCheck size={14} />} Save settings
        </button>
      </div>
    </>
  );
}

function Toggle({ label, hint, value, onChange }) {
  return (
    <div className="bsdc-flex bsdc-justify-between bsdc-items-center" style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
      <div>
        <strong>{label}</strong>
        {hint && <div className="bsdc-text-xs bsdc-text-muted">{hint}</div>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        style={{
          width: 44, height: 24, borderRadius: 12, border: 'none',
          background: value ? 'var(--color-primary)' : 'var(--color-border)',
          position: 'relative', cursor: 'pointer'
        }}
        aria-pressed={value}
        aria-label={label}
      >
        <span style={{
          position: 'absolute', top: 2, left: value ? 22 : 2, width: 20, height: 20,
          borderRadius: '50%', background: '#fff', transition: 'left 150ms ease'
        }} />
      </button>
    </div>
  );
}

function NumField({ label, value, onChange }) {
  return (
    <div className="bsdc-input-group">
      <label className="bsdc-input-label">{label}</label>
      <input type="number" min={0} className="bsdc-input" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} />
    </div>
  );
}
