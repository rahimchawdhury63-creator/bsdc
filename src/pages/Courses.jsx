/**
 * src/pages/Courses.jsx
 * /courses — directory + the default full-stack course tile.
 *
 * /courses/:slug      → reader (CourseSystem)
 * /courses/:slug/exam → exam (ExamSystem)
 */
import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import {
  collection, getDocs, query, orderBy, limit
} from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { DEFAULT_COURSE } from '../data/defaultCourse.js';
import SEOHead from '../components/seo/SEOHead.jsx';
import BreadcrumbSEO from '../components/seo/BreadcrumbSEO.jsx';
import CourseSystem from '../components/developer/CourseSystem.jsx';
import ExamSystem from '../components/developer/ExamSystem.jsx';
import { LoadingCenter } from '../components/common/Spinner.jsx';
import {
  IconBookOpen, IconAward, IconClock, IconLightning
} from '../components/common/Icons.jsx';

export default function Courses() {
  const { slug } = useParams();
  const location = useLocation();

  // Sub-routes inside /courses/* are dispatched here for simplicity.
  if (slug && location.pathname.endsWith('/exam')) return <ExamSystem />;
  if (slug) return <CourseSystem />;

  return <CourseDirectory />;
}

function CourseDirectory() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, 'courses'), orderBy('createdAt', 'desc'), limit(40)));
        const fromDb = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Always surface the default course first if not duplicated.
        const hasDefault = fromDb.find((c) => c.slug === DEFAULT_COURSE.slug);
        const list = hasDefault ? fromDb : [DEFAULT_COURSE, ...fromDb];
        if (!cancelled) { setCourses(list); setLoading(false); }
      } catch {
        if (!cancelled) { setCourses([DEFAULT_COURSE]); setLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <SEOHead
        title="Courses"
        description="Free, self-paced courses for Bangladeshi developers. Earn an official BSDC certificate after passing the 20-MCQ exam."
        canonical="/courses"
        keywords={['courses', 'tutorial', 'web development bangladesh', 'free coding course']}
      />
      <BreadcrumbSEO items={[{ name: 'Home', url: '/' }, { name: 'Courses', url: '/courses' }]} />

      <h1 style={{ margin: 0, fontSize: '1.4rem' }}><IconBookOpen size={20} /> Courses</h1>
      <p className="bsdc-text-muted bsdc-text-sm">
        Read the modules, pass the exam, earn a verifiable BSDC certificate.
      </p>

      {loading ? <LoadingCenter /> : (
        <div className="bsdc-grid-2 bsdc-mt-md">
          {courses.map((c) => (
            <Link
              key={c.slug || c.id}
              to={`/courses/${c.slug || c.id}`}
              className="bsdc-card"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="bsdc-flex bsdc-gap-md bsdc-items-start">
                <span className="bsdc-bootstrap__icon" style={{ width: 56, height: 56, marginBottom: 0 }}>
                  <IconLightning size={26} color="#1a6b3a" />
                </span>
                <div className="bsdc-flex-1">
                  <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{c.title}</h3>
                  <p className="bsdc-text-muted bsdc-text-sm" style={{ margin: '4px 0' }}>{c.summary}</p>
                  <div className="bsdc-flex bsdc-flex-wrap bsdc-gap-sm bsdc-mt-sm">
                    <span className="bsdc-chip"><IconClock size={12} /> {c.durationHours || 20}h</span>
                    <span className="bsdc-chip">{c.difficulty || 'beginner'}</span>
                    <span className="bsdc-chip"><IconAward size={12} /> +{c.pointsReward || 100} pts on pass</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
