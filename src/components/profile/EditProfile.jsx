/**
 * src/components/profile/EditProfile.jsx
 * ---------------------------------------------------------------------------
 * Profile editing modal. Lets the user update:
 *   - Display name, bio, title, location
 *   - Avatar (Cloudinary)
 *   - Banner (ImgBB)
 *   - Social links (GitHub, LinkedIn, Twitter, website)
 *   - Skills (tag input)
 *   - Language preference
 *
 * Username is NOT editable here — changing it would break all profile
 * URLs and inbound links. We expose a separate flow if ever needed.
 * ---------------------------------------------------------------------------
 */

import React, { useState, useRef } from 'react';
import { updateUser } from '../../firebase/firestore.js';
import { uploadImage } from '../../utils/imageUpload.js';
import { uploadAvatar } from '../../utils/videoUpload.js';
import { toast } from '../common/Toast.jsx';
import Spinner from '../common/Spinner.jsx';
import Avatar from '../common/Avatar.jsx';
import {
  IconClose, IconCamera, IconImage, IconPlus, IconX, IconLightning
} from '../common/Icons.jsx';
import { isValidUrl } from '../../utils/validators.js';

export default function EditProfile({ profile, onClose, onSaved }) {
  const [form, setForm] = useState({
    displayName: profile.displayName || '',
    bio: profile.bio || '',
    title: profile.title || '',
    location: profile.location || '',
    photoURL: profile.photoURL || '',
    bannerURL: profile.bannerURL || '',
    language: profile.language || 'en',
    skills: profile.skills || [],
    socialLinks: { ...(profile.socialLinks || {}) }
  });
  const [skillInput, setSkillInput] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [saving, setSaving] = useState(false);
  const avatarRef = useRef();
  const bannerRef = useRef();

  const change = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const changeSocial = (key, value) =>
    setForm((f) => ({ ...f, socialLinks: { ...f.socialLinks, [key]: value } }));

  /** Avatar pick → Cloudinary upload → local state update. */
  const onAvatarPick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const result = await uploadAvatar(file);
      change('photoURL', result.url);
      toast.success('Avatar uploaded.');
    } catch (err) {
      toast.error(err.message || 'Avatar upload failed.');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  /** Banner pick → ImgBB upload → local state update. */
  const onBannerPick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      const result = await uploadImage(file);
      change('bannerURL', result.url);
      toast.success('Banner uploaded.');
    } catch (err) {
      toast.error(err.message || 'Banner upload failed.');
    } finally {
      setUploadingBanner(false);
      e.target.value = '';
    }
  };

  const addSkill = () => {
    const s = skillInput.trim().toLowerCase().replace(/[^a-z0-9+#.]/g, '');
    if (!s || form.skills.includes(s) || form.skills.length >= 20) {
      setSkillInput('');
      return;
    }
    change('skills', [...form.skills, s]);
    setSkillInput('');
  };

  const removeSkill = (s) => change('skills', form.skills.filter((x) => x !== s));

  /** Save → Firestore update; closes modal on success. */
  const onSave = async (e) => {
    e.preventDefault();
    if (saving) return;

    // Validate any social URL fields the user typed.
    for (const k of ['github', 'linkedin', 'twitter', 'website']) {
      const v = form.socialLinks[k];
      if (v && !isValidUrl(v)) {
        toast.error(`Please enter a valid URL for ${k}.`);
        return;
      }
    }

    setSaving(true);
    try {
      // Auto-build the SEO description from the new bio/title.
      const seoDescription =
        (form.bio && form.bio.slice(0, 160))
        || `${form.displayName || profile.username} on BSDC — ${form.title || 'Bangladesh developer'}.`;

      await updateUser(profile.uid, {
        ...form,
        seoTitle: `bsdc • ${profile.username} | Bangladesh Software Development Community`,
        seoDescription
      });
      toast.success('Profile saved.');
      if (onSaved) onSaved();
      if (onClose) onClose();
    } catch (err) {
      toast.error(err?.message || 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bsdc-modal-backdrop" role="dialog" aria-label="Edit profile" onClick={onClose}>
      <div className="bsdc-modal bsdc-modal--lg" onClick={(e) => e.stopPropagation()}>
        <div className="bsdc-modal__header">
          <h2 className="bsdc-modal__title">Edit profile</h2>
          <button type="button" className="bsdc-icon-btn" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </div>

        <form onSubmit={onSave} className="bsdc-modal__body">
          {/* Banner */}
          <label className="bsdc-input-label">Banner image</label>
          <div
            style={{
              position: 'relative',
              height: 160,
              borderRadius: 'var(--radius-md)',
              background: form.bannerURL
                ? `url(${form.bannerURL}) center/cover`
                : 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
              marginBottom: 'var(--space-md)',
              overflow: 'hidden'
            }}
          >
            <button
              type="button"
              className="bsdc-btn bsdc-btn--secondary bsdc-btn--sm"
              style={{ position: 'absolute', right: 12, bottom: 12 }}
              onClick={() => bannerRef.current?.click()}
              disabled={uploadingBanner}
            >
              {uploadingBanner ? <Spinner size="sm" /> : <IconImage size={14} />} Change banner
            </button>
            <input
              ref={bannerRef}
              type="file"
              accept="image/*"
              onChange={onBannerPick}
              style={{ display: 'none' }}
            />
          </div>

          {/* Avatar */}
          <div className="bsdc-flex bsdc-items-center bsdc-gap-md bsdc-mb-md">
            <Avatar src={form.photoURL} name={form.displayName} size="xl" />
            <div>
              <button
                type="button"
                className="bsdc-btn bsdc-btn--outline bsdc-btn--sm"
                onClick={() => avatarRef.current?.click()}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? <Spinner size="sm" /> : <IconCamera size={14} />} Upload avatar
              </button>
              <input
                ref={avatarRef}
                type="file"
                accept="image/*"
                onChange={onAvatarPick}
                style={{ display: 'none' }}
              />
              <p className="bsdc-input-help">PNG/JPG, up to 8MB. Square images look best.</p>
            </div>
          </div>

          <div className="bsdc-grid-2">
            <Field label="Display name">
              <input
                type="text"
                className="bsdc-input"
                value={form.displayName}
                onChange={(e) => change('displayName', e.target.value)}
                maxLength={50}
              />
            </Field>
            <Field label="Title / Profession">
              <input
                type="text"
                className="bsdc-input"
                value={form.title}
                onChange={(e) => change('title', e.target.value)}
                placeholder="e.g. Full-Stack Developer"
                maxLength={80}
              />
            </Field>
          </div>

          <Field label="Bio" help={`${form.bio.length}/280 — also used as your SEO description.`}>
            <textarea
              className="bsdc-textarea"
              value={form.bio}
              onChange={(e) => change('bio', e.target.value.slice(0, 280))}
              placeholder="Tell the community about yourself."
              rows={3}
            />
          </Field>

          <div className="bsdc-grid-2">
            <Field label="Location">
              <input
                type="text"
                className="bsdc-input"
                value={form.location}
                onChange={(e) => change('location', e.target.value)}
                placeholder="Dhaka, Bangladesh"
                maxLength={60}
              />
            </Field>
            <Field label="Language">
              <select
                className="bsdc-select"
                value={form.language}
                onChange={(e) => change('language', e.target.value)}
              >
                <option value="en">English</option>
                <option value="bn">বাংলা (Bangla)</option>
              </select>
            </Field>
          </div>

          {/* Skills */}
          <Field label="Skills" help="Up to 20 tags. Press Enter to add.">
            <div className="bsdc-flex bsdc-gap-xs bsdc-flex-wrap bsdc-mb-sm">
              {form.skills.map((s) => (
                <span key={s} className="bsdc-chip">
                  #{s}
                  <button
                    type="button"
                    aria-label={`Remove ${s}`}
                    onClick={() => removeSkill(s)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <IconX size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="bsdc-flex bsdc-gap-sm">
              <input
                type="text"
                className="bsdc-input"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
                }}
                placeholder="react, nodejs, python..."
                maxLength={24}
              />
              <button type="button" className="bsdc-btn bsdc-btn--secondary" onClick={addSkill}>
                <IconPlus size={14} /> Add
              </button>
            </div>
          </Field>

          {/* Social links */}
          <div className="bsdc-divider" />
          <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-sm)' }}>Social links</h3>
          <div className="bsdc-grid-2">
            <Field label="GitHub URL">
              <input
                type="url"
                className="bsdc-input"
                value={form.socialLinks.github || ''}
                onChange={(e) => changeSocial('github', e.target.value)}
                placeholder="https://github.com/username"
              />
            </Field>
            <Field label="LinkedIn URL">
              <input
                type="url"
                className="bsdc-input"
                value={form.socialLinks.linkedin || ''}
                onChange={(e) => changeSocial('linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/username"
              />
            </Field>
            <Field label="Twitter / X URL">
              <input
                type="url"
                className="bsdc-input"
                value={form.socialLinks.twitter || ''}
                onChange={(e) => changeSocial('twitter', e.target.value)}
                placeholder="https://x.com/username"
              />
            </Field>
            <Field label="Website">
              <input
                type="url"
                className="bsdc-input"
                value={form.socialLinks.website || ''}
                onChange={(e) => changeSocial('website', e.target.value)}
                placeholder="https://example.com"
              />
            </Field>
          </div>

          {/* SEO tip card */}
          <div
            className="bsdc-card bsdc-mt-md"
            style={{ borderLeft: '4px solid var(--color-primary)' }}
          >
            <div className="bsdc-flex bsdc-items-center bsdc-gap-sm">
              <IconLightning size={18} color="var(--color-primary)" />
              <strong className="bsdc-text-primary">SEO tip</strong>
            </div>
            <p className="bsdc-text-sm bsdc-text-muted" style={{ marginTop: 6 }}>
              A clear bio that mentions your role and Bangladesh helps Google show
              your profile to people searching for developers in your area.
            </p>
          </div>
        </form>

        <div className="bsdc-modal__footer">
          <button type="button" className="bsdc-btn bsdc-btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="bsdc-btn bsdc-btn--primary" onClick={onSave} disabled={saving}>
            {saving ? <Spinner size="sm" /> : null} Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

/** Compact field wrapper for label + control + help text. */
function Field({ label, help, children }) {
  return (
    <div className="bsdc-input-group">
      <label className="bsdc-input-label">{label}</label>
      {children}
      {help && <p className="bsdc-input-help">{help}</p>}
    </div>
  );
}
