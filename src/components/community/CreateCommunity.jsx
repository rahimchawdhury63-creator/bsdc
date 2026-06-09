/**
 * src/components/community/CreateCommunity.jsx
 * Modal — create a new community (Reddit-style sub).
 *
 * Stored at /communities/{id} with a unique URL slug.
 * Founder becomes admin + first moderator.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection, doc, setDoc, getDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import { uploadImage } from '../../utils/imageUpload.js';
import { slugify } from '../../utils/slugGenerator.js';
import { useAuth } from '../../hooks/useAuth.js';
import { toast } from '../common/Toast.jsx';
import Spinner from '../common/Spinner.jsx';
import Avatar from '../common/Avatar.jsx';
import {
  IconClose, IconUsers, IconImage
} from '../common/Icons.jsx';

export default function CreateCommunity({ open, onClose }) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [banner, setBanner] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(null);
  const slug = slugify(name);

  if (!open) return null;

  const pickIcon = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setUploading('icon');
    try { const r = await uploadImage(f); setIcon(r.url); }
    catch (err) { toast.error(err?.message || 'Upload failed.'); }
    finally { setUploading(null); }
  };

  const pickBanner = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setUploading('banner');
    try { const r = await uploadImage(f); setBanner(r.url); }
    catch (err) { toast.error(err?.message || 'Upload failed.'); }
    finally { setUploading(null); }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!profile) { toast.error('Sign in first.'); return; }
    if (!name.trim() || !slug) { toast.error('Please name the community.'); return; }

    setBusy(true);
    try {
      const ref = doc(collection(db, 'communities'), slug);
      const existing = await getDoc(ref);
      if (existing.exists()) {
        toast.error('That community name is taken.');
        setBusy(false);
        return;
      }
      await setDoc(ref, {
        id: slug,
        slug,
        name: name.trim(),
        description: description.trim(),
        rules: [],
        adminId: profile.uid,
        moderators: [profile.uid],
        members: 1,
        posts: 0,
        bannerURL: banner,
        iconURL: icon,
        tags: [],
        isPrivate: false,
        createdAt: serverTimestamp()
      });
      // Self-join.
      await setDoc(doc(db, 'communities', slug, 'members', profile.uid), {
        uid: profile.uid,
        joinedAt: serverTimestamp(),
        role: 'admin'
      });
      toast.success('Community created.');
      onClose();
      navigate(`/bsdc/${slug}`);
    } catch (err) {
      toast.error(err?.message || 'Could not create community.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bsdc-modal-backdrop" role="dialog" aria-label="New community" onClick={onClose}>
      <div className="bsdc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bsdc-modal__header">
          <h2 className="bsdc-modal__title"><IconUsers /> New community</h2>
          <button type="button" className="bsdc-icon-btn" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>
        <form onSubmit={submit} className="bsdc-modal__body">
          <div className="bsdc-flex bsdc-gap-md bsdc-mb-md">
            <label style={{ cursor: 'pointer', position: 'relative' }}>
              <Avatar src={icon} name={name || 'C'} size="lg" />
              <span style={{
                position: 'absolute', bottom: -4, right: -4,
                background: 'var(--color-primary)', color: '#fff',
                borderRadius: '50%', padding: 4, display: 'inline-flex'
              }}>
                {uploading === 'icon' ? <Spinner size="sm" /> : <IconImage size={12} />}
              </span>
              <input type="file" accept="image/*" onChange={pickIcon} style={{ display: 'none' }} />
            </label>
            <div className="bsdc-flex-1">
              <label className="bsdc-input-label">Name</label>
              <input
                type="text"
                className="bsdc-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Next.js Bangladesh"
                maxLength={60}
                required
              />
              <p className="bsdc-input-help">URL: bsdc.info.bd/bsdc/<strong>{slug || 'community-name'}</strong></p>
            </div>
          </div>

          <div className="bsdc-input-group">
            <label className="bsdc-input-label">Description</label>
            <textarea
              className="bsdc-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={280}
              placeholder="What's this community about?"
            />
          </div>

          <div className="bsdc-input-group">
            <label className="bsdc-input-label">Banner (optional)</label>
            <div style={{
              position: 'relative', height: 120, borderRadius: 'var(--radius-md)',
              background: banner ? `url(${banner}) center/cover` : 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))'
            }}>
              <button
                type="button"
                className="bsdc-btn bsdc-btn--secondary bsdc-btn--sm"
                style={{ position: 'absolute', right: 12, bottom: 12 }}
                onClick={(e) => e.currentTarget.previousSibling?.click?.()}
                disabled={uploading === 'banner'}
              >
                {uploading === 'banner' ? <Spinner size="sm" /> : <IconImage size={14} />} Banner
              </button>
              <input type="file" accept="image/*" onChange={pickBanner} style={{ display: 'none' }} />
            </div>
          </div>
        </form>

        <div className="bsdc-modal__footer">
          <button type="button" className="bsdc-btn bsdc-btn--ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="button" className="bsdc-btn bsdc-btn--primary" onClick={submit} disabled={busy || !name.trim()}>
            {busy && <Spinner size="sm" />} Create community
          </button>
        </div>
      </div>
    </div>
  );
}
