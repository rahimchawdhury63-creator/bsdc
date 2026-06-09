/**
 * src/admin/SEOManager.jsx
 * Edit global SEO defaults at /seoSettings/global. Sitemap regeneration
 * happens on the next deploy (GitHub Actions runs npm run build).
 */
import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config.js';
import Spinner from '../components/common/Spinner.jsx';
import { toast } from '../components/common/Toast.jsx';
import { IconLightning, IconCheck } from '../components/common/Icons.jsx';

const DEFAULTS = {
  homeTitle: 'Bangladesh Software Development Community | BSDC',
  homeDescription: "Bangladesh's largest community for software developers and students.",
  homeKeywords: 'bangladesh developers, bsdc, software development bangladesh, programming community',
  defaultOgImage: 'https://www.bsdc.info.bd/og-image.png',
  twitterHandle: '@bsdc_bd',
  googleAnalyticsId: '',
  searchConsoleVerification: ''
};

export default function SEOManager() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'seoSettings', 'global'))
      .then((s) => { if (s.exists()) setSettings({ ...DEFAULTS, ...s.data() }); })
      .catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'seoSettings', 'global'), { ...settings, updatedAt: serverTimestamp() }, { merge: true });
      toast.success('SEO defaults saved.');
    } catch (err) { toast.error(err?.message || 'Save failed.'); }
    finally { setSaving(false); }
  };

  return (
    <>
      <h1 style={{ marginTop: 0, fontSize: '1.3rem' }}><IconLightning size={18} /> SEO defaults</h1>
      <div className="bsdc-card" style={{ maxWidth: 760 }}>
        {Object.entries(DEFAULTS).map(([k]) => (
          <div key={k} className="bsdc-input-group">
            <label className="bsdc-input-label">{k}</label>
            <input
              type="text"
              className="bsdc-input"
              value={settings[k] || ''}
              onChange={(e) => setSettings({ ...settings, [k]: e.target.value })}
            />
          </div>
        ))}
        <button type="button" className="bsdc-btn bsdc-btn--primary" onClick={save} disabled={saving}>
          {saving ? <Spinner size="sm" /> : <IconCheck size={14} />} Save defaults
        </button>
        <p className="bsdc-text-xs bsdc-text-muted bsdc-mt-md">
          <strong>Sitemap &amp; RSS</strong> are regenerated on every Cloudflare Pages deploy. Push a commit (or trigger a re-deploy) to refresh them.
        </p>
      </div>
    </>
  );
}
