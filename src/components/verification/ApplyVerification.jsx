/**
 * src/components/verification/ApplyVerification.jsx
 * ---------------------------------------------------------------------------
 * The verification application flow.
 *
 * User uploads either NID or birth certificate + mobile number.
 * Document image goes to ImgBB; URL stored in /verificationRequests.
 * Admin (Response 10) reviews and approves → updates user.isVerified.
 *
 * Status states:
 *   - none      : not requested → show the form
 *   - pending   : show "under review" message
 *   - approved  : show success
 *   - rejected  : let them re-apply
 * ---------------------------------------------------------------------------
 */

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import { useAuth } from '../../hooks/useAuth.js';
import { uploadImage } from '../../utils/imageUpload.js';
import { isValidBdMobile } from '../../utils/validators.js';
import { toast } from '../common/Toast.jsx';
import Spinner from '../common/Spinner.jsx';
import {
  IconShield, IconUpload, IconCheck, IconAlert, IconClose
} from '../common/Icons.jsx';

export default function ApplyVerification() {
  const { profile } = useAuth();
  const [docType, setDocType] = useState('nid');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [mobile, setMobile] = useState('');
  const [busy, setBusy] = useState(false);
  const [latestRequest, setLatestRequest] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  /** Load current verification status. */
  useEffect(() => {
    if (!profile?.uid) return;
    (async () => {
      try {
        const snap = await getDocs(query(
          collection(db, 'verificationRequests'),
          where('userId', '==', profile.uid),
          orderBy('createdAt', 'desc'),
          limit(1)
        ));
        if (!snap.empty) {
          setLatestRequest({ id: snap.docs[0].id, ...snap.docs[0].data() });
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[BSDC] verification status load:', err);
      } finally {
        setLoadingStatus(false);
      }
    })();
  }, [profile?.uid]);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 6 * 1024 * 1024) {
      toast.error('Document image must be 6MB or less.');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!file) return toast.error('Please attach your document image.');
    if (!isValidBdMobile(mobile)) return toast.error('Please enter a valid Bangladeshi mobile (01XXXXXXXXX).');

    setBusy(true);
    try {
      const upload = await uploadImage(file);
      await addDoc(collection(db, 'verificationRequests'), {
        userId: profile.uid,
        username: profile.username,
        documentType: docType,
        documentImageURL: upload.url,
        mobileNumber: mobile.trim(),
        status: 'pending',
        adminNote: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success('Verification request submitted. Our team will review within 48 hours.');
      setLatestRequest({ status: 'pending', documentType: docType });
    } catch (err) {
      toast.error(err?.message || 'Could not submit verification.');
    } finally {
      setBusy(false);
    }
  };

  if (!profile) {
    return (
      <div className="bsdc-empty">
        <div className="bsdc-empty__title">Sign in to apply for verification</div>
      </div>
    );
  }

  if (loadingStatus) return <Spinner />;

  // Status views.
  if (profile.isVerified) {
    return (
      <StatusCard
        kind="success"
        title="You're verified"
        body="Your blue checkmark is visible across BSDC. Thank you for being part of the community."
      />
    );
  }
  if (latestRequest?.status === 'pending') {
    return (
      <StatusCard
        kind="info"
        title="Application under review"
        body="We typically respond within 48 hours. You'll be notified by push notification when a decision is made."
      />
    );
  }

  // Form view.
  return (
    <>
      <Helmet>
        <title>Apply for verification | BSDC</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="bsdc-card bsdc-card--raised">
        <div className="bsdc-flex bsdc-items-center bsdc-gap-md bsdc-mb-md">
          <span className="bsdc-bootstrap__icon" style={{ width: 56, height: 56, marginBottom: 0 }}>
            <IconShield size={28} color="#1a6b3a" />
          </span>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.3rem' }}>Apply for verification</h1>
            <p className="bsdc-text-muted bsdc-text-sm" style={{ margin: 0 }}>
              Get a blue checkmark next to your name. Free for Bangladeshi developers and students.
            </p>
          </div>
        </div>

        {latestRequest?.status === 'rejected' && (
          <div className="bsdc-toast bsdc-toast--danger" style={{ position: 'static', marginBottom: 16 }}>
            <IconAlert size={18} color="#d32f2f" />
            <div className="bsdc-flex-1">
              <strong>Previous request rejected.</strong>
              <p className="bsdc-text-sm" style={{ margin: 0 }}>
                {latestRequest.adminNote || 'Please re-upload a clearer copy of your document.'}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={submit}>
          <div className="bsdc-input-group">
            <label className="bsdc-input-label">Document type</label>
            <div className="bsdc-flex bsdc-gap-sm">
              <button
                type="button"
                className={`bsdc-chip ${docType === 'nid' ? 'bsdc-chip--active' : ''}`}
                onClick={() => setDocType('nid')}
              >
                NID Card
              </button>
              <button
                type="button"
                className={`bsdc-chip ${docType === 'birth_certificate' ? 'bsdc-chip--active' : ''}`}
                onClick={() => setDocType('birth_certificate')}
              >
                Birth Certificate
              </button>
            </div>
          </div>

          <div className="bsdc-input-group">
            <label className="bsdc-input-label">Mobile number</label>
            <input
              type="tel"
              className="bsdc-input"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="01XXXXXXXXX"
              maxLength={11}
              inputMode="numeric"
              required
            />
            <p className="bsdc-input-help">We may call you to confirm your identity. Not shown publicly.</p>
          </div>

          <div className="bsdc-input-group">
            <label className="bsdc-input-label">Document image</label>
            <div
              style={{
                position: 'relative',
                border: '2px dashed var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: preview ? 8 : 24,
                textAlign: 'center',
                background: 'var(--color-bg)',
                minHeight: 140
              }}
            >
              {preview ? (
                <>
                  <img
                    src={preview}
                    alt="Document preview"
                    style={{ maxWidth: '100%', maxHeight: 240, borderRadius: 'var(--radius-md)', margin: '0 auto' }}
                  />
                  <button
                    type="button"
                    className="bsdc-icon-btn"
                    aria-label="Remove image"
                    onClick={() => { setFile(null); setPreview(''); }}
                    style={{ position: 'absolute', top: 8, right: 8, background: '#fff' }}
                  >
                    <IconClose size={16} />
                  </button>
                </>
              ) : (
                <>
                  <IconUpload size={32} color="#888" />
                  <p style={{ margin: '8px 0 0' }}>Tap to upload a photo of your document</p>
                  <p className="bsdc-text-xs bsdc-text-muted">JPG/PNG, up to 6MB</p>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={onFile}
                aria-label="Upload document"
                style={{
                  position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer'
                }}
              />
            </div>
          </div>

          <p className="bsdc-text-xs bsdc-text-muted bsdc-mb-md">
            Your document is uploaded securely to our image host and reviewed only by
            BSDC administrators. We never publish it.
          </p>

          <button type="submit" className="bsdc-btn bsdc-btn--primary bsdc-btn--block" disabled={busy}>
            {busy ? <Spinner size="sm" /> : <IconCheck size={16} />} Submit for review
          </button>
        </form>
      </div>
    </>
  );
}

/** Reusable status card. */
function StatusCard({ kind, title, body }) {
  const variant = kind === 'success' ? 'success' : kind === 'info' ? 'info' : 'danger';
  return (
    <div className="bsdc-card bsdc-card--raised" style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
      <span
        className="bsdc-bootstrap__icon"
        style={{
          width: 64, height: 64, marginBottom: 16,
          background: `var(--color-accent)`, color: `var(--color-${variant})`
        }}
      >
        {kind === 'success' ? <IconCheck size={32} /> : <IconShield size={32} />}
      </span>
      <h1 style={{ fontSize: '1.3rem', margin: 0 }}>{title}</h1>
      <p className="bsdc-text-muted bsdc-mt-sm">{body}</p>
    </div>
  );
}
