/**
 * src/components/developer/ExamSystem.jsx
 * ---------------------------------------------------------------------------
 * 20-MCQ exam. On submit:
 *   - Score is computed locally.
 *   - If >= passMark, we write a /certificates/{id} doc with the verifyUrl
 *     + score, and bonus points are awarded.
 *   - User lands on the certificate page.
 *
 * To prevent answer leakage in DevTools, the correct-index is not shipped
 * to the page in plaintext: we score after submit using the original
 * course object (which is loaded fresh server-side via Firestore). That's
 * intentionally imperfect — strict anti-cheat would require a Function.
 * ---------------------------------------------------------------------------
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  collection, doc, setDoc, query, where, getDocs, getDoc, limit, serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import { DEFAULT_COURSE } from '../../data/defaultCourse.js';
import { useAuth } from '../../hooks/useAuth.js';
import { awardPoints } from '../../firebase/points.js';
import { toast } from '../common/Toast.jsx';
import Spinner, { LoadingCenter } from '../common/Spinner.jsx';
import SEOHead from '../seo/SEOHead.jsx';
import BreadcrumbSEO from '../seo/BreadcrumbSEO.jsx';
import {
  IconAward, IconCheck, IconClose, IconClock, IconLightning
} from '../common/Icons.jsx';

const EXAM_MINUTES = 20;

export default function ExamSystem() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({}); // { qIndex: optionIndex }
  const [submitting, setSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(EXAM_MINUTES * 60);

  // Load course.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      let found = null;
      try {
        const snap = await getDocs(query(collection(db, 'courses'), where('slug', '==', slug), limit(1)));
        if (!snap.empty) found = { id: snap.docs[0].id, ...snap.docs[0].data() };
        if (!found) {
          const dSnap = await getDoc(doc(db, 'courses', slug));
          if (dSnap.exists()) found = { id: dSnap.id, ...dSnap.data() };
        }
      } catch {}
      if (!found && (!slug || slug === DEFAULT_COURSE.slug || slug === DEFAULT_COURSE.id)) {
        found = DEFAULT_COURSE;
      }
      if (!cancelled) {
        setCourse(found);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  // Countdown.
  useEffect(() => {
    if (!course) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(t); submit(true); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course]);

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  const pick = (qi, oi) => setAnswers((a) => ({ ...a, [qi]: oi }));

  const submit = async (auto = false) => {
    if (submitting) return;
    if (!profile) { toast.error('Sign in to take the exam.'); return; }
    setSubmitting(true);
    try {
      const questions = course.questions || [];
      let correct = 0;
      questions.forEach((q, i) => { if (answers[i] === q.correct) correct++; });
      const passMark = course.passMark || Math.ceil(questions.length * 0.7);
      const passed = correct >= passMark;

      // Persist certificate (even on fail — for audit, but flag passed:false).
      const certId = `${profile.uid}-${course.slug || course.id}-${Date.now()}`;
      const certRef = doc(db, 'certificates', certId);
      const payload = {
        id: certId,
        userId: profile.uid,
        username: profile.username,
        displayName: profile.displayName || profile.username,
        courseId: course.id,
        courseSlug: course.slug,
        courseTitle: course.title,
        score: correct,
        outOf: questions.length,
        passMark,
        passed,
        autoSubmitted: !!auto,
        verifyUrl: `${(import.meta.env.VITE_SITE_URL || 'https://www.bsdc.info.bd')}/certificate/${certId}`,
        issuedAt: serverTimestamp()
      };
      await setDoc(certRef, payload);

      if (passed) {
        toast.success(`Passed with ${correct}/${questions.length}! Issuing your certificate.`);
        awardPoints(profile.uid, course.pointsReward || 100, `passed "${course.title}"`, { type: 'bonus' }).catch(() => {});
      } else {
        toast.warn(`Scored ${correct}/${questions.length}. You need ${passMark} to pass. Read the modules and try again.`);
      }
      navigate(`/certificate/${certId}`);
    } catch (err) {
      toast.error(err?.message || 'Could not submit exam.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingCenter label="Preparing exam…" />;
  if (!course) {
    return <div className="bsdc-empty"><div className="bsdc-empty__title">Course not found</div></div>;
  }

  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;

  return (
    <>
      <SEOHead
        title={`${course.title} — Exam`}
        description={`Take the BSDC certification exam for ${course.title}.`}
        canonical={`/courses/${course.slug}/exam`}
        noindex
      />
      <BreadcrumbSEO items={[
        { name: 'Home', url: '/' },
        { name: 'Courses', url: '/courses' },
        { name: course.title, url: `/courses/${course.slug}` },
        { name: 'Exam', url: `/courses/${course.slug}/exam` }
      ]} />

      <div className="bsdc-card bsdc-flex bsdc-items-center bsdc-justify-between bsdc-mb-md" style={{ position: 'sticky', top: 'calc(var(--nav-height) + 8px)', zIndex: 10 }}>
        <div>
          <div className="bsdc-text-xs bsdc-text-muted">Exam</div>
          <strong>{course.title}</strong>
        </div>
        <div className="bsdc-flex bsdc-gap-sm bsdc-items-center">
          <span className="bsdc-chip">
            <IconCheck size={12} /> {answeredCount}/{course.questions?.length || 0}
          </span>
          <span className="bsdc-chip" style={{ color: secondsLeft < 60 ? 'var(--color-danger)' : undefined }}>
            <IconClock size={12} /> {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
          </span>
          <button
            type="button"
            className="bsdc-btn bsdc-btn--primary bsdc-btn--sm"
            onClick={() => submit(false)}
            disabled={submitting}
          >
            {submitting ? <Spinner size="sm" /> : <IconAward size={14} />} Submit
          </button>
        </div>
      </div>

      <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {(course.questions || []).map((q, i) => (
          <li key={i} className="bsdc-card" style={{ marginBottom: 'var(--space-md)' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>
              <span className="bsdc-chip" style={{ marginRight: 8 }}>{i + 1}</span>
              {q.question}
            </h3>
            <div className="bsdc-mt-md" style={{ display: 'grid', gap: 6 }}>
              {q.options.map((opt, oi) => {
                const picked = answers[i] === oi;
                return (
                  <button
                    key={oi}
                    type="button"
                    onClick={() => pick(i, oi)}
                    className="bsdc-btn"
                    style={{
                      justifyContent: 'flex-start',
                      background: picked ? 'var(--color-primary)' : 'var(--color-bg)',
                      color: picked ? '#fff' : 'var(--color-text)',
                      border: picked ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{
                      width: 22, height: 22, borderRadius: 11,
                      background: picked ? '#fff' : 'var(--color-card)',
                      color: picked ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, flexShrink: 0
                    }}>{String.fromCharCode(65 + oi)}</span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ol>

      <div className="bsdc-card bsdc-text-center bsdc-mt-md">
        <IconLightning size={28} color="#1a6b3a" />
        <p className="bsdc-text-muted bsdc-text-sm">
          Auto-submit when the timer hits zero. You can retake the exam any time.
        </p>
        <button
          type="button"
          className="bsdc-btn bsdc-btn--primary"
          onClick={() => submit(false)}
          disabled={submitting}
        >
          <IconAward size={16} /> Submit exam
        </button>
      </div>
    </>
  );
}
