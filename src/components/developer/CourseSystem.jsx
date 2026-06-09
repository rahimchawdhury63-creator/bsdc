/**
 * src/components/developer/CourseSystem.jsx
 * ---------------------------------------------------------------------------
 * Renders one course end-to-end:
 *   - reading view (modules)
 *   - sticky table of contents on the side
 *   - progress saved to localStorage so the bar persists across refreshes
 *   - "Take exam" button (only enabled after all modules are scrolled past)
 *
 * Loads the course from Firestore /courses/{slug}. If missing, falls back
 * to the bundled DEFAULT_COURSE so the platform is never empty.
 * ---------------------------------------------------------------------------
 */

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import { DEFAULT_COURSE } from '../../data/defaultCourse.js';
import { useAuth } from '../../hooks/useAuth.js';
import SEOHead from '../seo/SEOHead.jsx';
import BreadcrumbSEO from '../seo/BreadcrumbSEO.jsx';
import JsonLD from '../seo/JsonLD.jsx';
import { LoadingCenter } from '../common/Spinner.jsx';
import {
  IconBookOpen, IconCheck, IconAward, IconClock, IconLightning
} from '../common/Icons.jsx';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://www.bsdc.info.bd';

/** localStorage key for per-user, per-course progress. */
function progressKey(uid, slug) { return `bsdc.course.${uid || 'guest'}.${slug}`; }

export default function CourseSystem() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [readModules, setReadModules] = useState({});
  const moduleRefs = useRef({});

  // Load course (Firestore → fallback to default).
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        let found = null;
        if (slug) {
          // Try by slug field first.
          const snap = await getDocs(query(collection(db, 'courses'), where('slug', '==', slug), limit(1)));
          if (!snap.empty) found = { id: snap.docs[0].id, ...snap.docs[0].data() };
          if (!found) {
            // Fallback to ID lookup.
            const docSnap = await getDoc(doc(db, 'courses', slug));
            if (docSnap.exists()) found = { id: docSnap.id, ...docSnap.data() };
          }
        }
        if (!found && (!slug || slug === DEFAULT_COURSE.slug || slug === DEFAULT_COURSE.id)) {
          found = DEFAULT_COURSE;
        }
        if (!cancelled) {
          setCourse(found);
          if (found) {
            const saved = JSON.parse(localStorage.getItem(progressKey(profile?.uid, found.slug)) || '{}');
            setReadModules(saved);
          }
          setLoading(false);
        }
      } catch {
        if (!cancelled) { setLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, [slug, profile?.uid]);

  // IntersectionObserver marks a module as "read" once it's been on screen.
  useEffect(() => {
    if (!course) return;
    const obs = new IntersectionObserver((entries) => {
      let dirty = false;
      const next = { ...readModules };
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const id = entry.target.dataset.moduleId;
          if (!next[id]) { next[id] = 1; dirty = true; }
        }
      }
      if (dirty) {
        setReadModules(next);
        try { localStorage.setItem(progressKey(profile?.uid, course.slug), JSON.stringify(next)); } catch {}
      }
    }, { threshold: 0.6 });

    Object.values(moduleRefs.current).forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?.id]);

  const progress = useMemo(() => {
    if (!course?.modules?.length) return 0;
    return Object.keys(readModules).length / course.modules.length;
  }, [readModules, course]);

  const canTakeExam = progress >= 1;

  if (loading) return <LoadingCenter label="Loading course…" />;
  if (!course) {
    return (
      <div className="bsdc-empty">
        <div className="bsdc-empty__icon"><IconBookOpen /></div>
        <div className="bsdc-empty__title">Course not found</div>
        <Link to="/courses" className="bsdc-btn bsdc-btn--primary bsdc-mt-md">All courses</Link>
      </div>
    );
  }

  // Course JSON-LD schema for Google rich result.
  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.summary,
    provider: {
      '@type': 'Organization',
      name: 'Bangladesh Software Development Community',
      sameAs: SITE_URL
    },
    inLanguage: course.language === 'bn' ? 'bn-BD' : 'en-BD',
    educationalLevel: course.difficulty,
    timeRequired: `PT${course.durationHours || 20}H`,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: `PT${course.durationHours || 20}H`
    }
  };

  return (
    <>
      <SEOHead
        title={course.title}
        description={course.summary}
        canonical={`/courses/${course.slug}`}
        ogType="article"
        keywords={['course', course.category, 'bangladesh', 'tutorial', 'web development']}
        language={course.language}
      />
      <JsonLD schema={courseSchema} id="course" />
      <BreadcrumbSEO items={[
        { name: 'Home', url: '/' },
        { name: 'Courses', url: '/courses' },
        { name: course.title, url: `/courses/${course.slug}` }
      ]} />

      {/* Hero */}
      <div className="bsdc-card">
        <div className="bsdc-flex bsdc-items-start bsdc-gap-md">
          <span className="bsdc-bootstrap__icon" style={{ width: 56, height: 56, marginBottom: 0 }}>
            <IconBookOpen size={28} color="#1a6b3a" />
          </span>
          <div className="bsdc-flex-1">
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{course.title}</h1>
            <p className="bsdc-text-muted" style={{ margin: '4px 0' }}>{course.summary}</p>
            <div className="bsdc-flex bsdc-gap-sm bsdc-flex-wrap bsdc-mt-sm">
              <span className="bsdc-chip"><IconClock size={12} /> {course.durationHours || 20}h read</span>
              <span className="bsdc-chip">{course.difficulty}</span>
              <span className="bsdc-chip">+{course.pointsReward || 100} BSDC Points on pass</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="bsdc-mt-md">
          <div className="bsdc-flex bsdc-justify-between bsdc-text-xs bsdc-text-muted">
            <span>Reading progress</span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <div style={{ height: 6, background: 'var(--color-accent)', borderRadius: 4, marginTop: 4 }}>
            <div style={{
              width: `${progress * 100}%`, height: '100%',
              background: 'var(--color-primary)', borderRadius: 4,
              transition: 'width 300ms ease'
            }} />
          </div>
        </div>

        <button
          type="button"
          className="bsdc-btn bsdc-btn--primary bsdc-btn--block bsdc-mt-md"
          onClick={() => navigate(`/courses/${course.slug}/exam`)}
          disabled={!canTakeExam}
          title={canTakeExam ? '' : 'Read every module first to unlock the exam.'}
        >
          <IconAward size={16} />
          {canTakeExam
            ? 'Take the 20-question certification exam'
            : `Read all modules to unlock the exam (${Math.round(progress * 100)}%)`}
        </button>
      </div>

      {/* Layout: TOC on the side (desktop) + reading column */}
      <div className="bsdc-grid bsdc-mt-md" style={{ gridTemplateColumns: '1fr', gap: 'var(--space-md)' }}>
        {/* Reading column */}
        <div>
          {course.modules.map((m, i) => (
            <article
              key={m.id || i}
              ref={(el) => { if (el) moduleRefs.current[m.id || i] = el; }}
              data-module-id={m.id || String(i)}
              className="bsdc-card bsdc-prose"
              style={{ marginBottom: 'var(--space-md)' }}
              id={`m-${m.id || i}`}
            >
              <div className="bsdc-flex bsdc-items-center bsdc-gap-sm bsdc-mb-sm">
                <span style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: readModules[m.id || i] ? 'var(--color-primary)' : 'var(--color-accent)',
                  color: readModules[m.id || i] ? '#fff' : 'var(--color-primary-dark)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700
                }}>
                  {readModules[m.id || i] ? <IconCheck size={14} /> : i + 1}
                </span>
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{m.title}</h2>
              </div>
              <pre style={{
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                background: 'transparent', color: 'inherit',
                padding: 0, fontFamily: 'inherit', fontSize: '1rem', lineHeight: 1.7
              }}>{m.body}</pre>
            </article>
          ))}

          {/* End-of-course CTA */}
          {canTakeExam && (
            <div className="bsdc-card bsdc-text-center" style={{
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
              color: '#fff'
            }}>
              <IconLightning size={32} color="#fff" />
              <h2 style={{ margin: '8px 0 4px' }}>You're ready for the exam</h2>
              <p style={{ opacity: 0.9 }}>20 MCQs · 14/20 to pass · earn an official BSDC certificate.</p>
              <Link
                to={`/courses/${course.slug}/exam`}
                className="bsdc-btn bsdc-btn--secondary"
                style={{ background: '#fff', color: 'var(--color-primary-dark)' }}
              >
                Start exam now
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
