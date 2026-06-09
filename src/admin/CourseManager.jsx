/**
 * src/admin/CourseManager.jsx
 * List Firestore courses + seed/restore the bundled default course.
 */
import React, { useEffect, useState } from 'react';
import {
  collection, getDocs, query, orderBy, doc, setDoc, serverTimestamp, deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { DEFAULT_COURSE } from '../data/defaultCourse.js';
import { LoadingCenter } from '../components/common/Spinner.jsx';
import { toast } from '../components/common/Toast.jsx';
import { confirmDialog } from '../components/common/ConfirmDialog.jsx';
import { Link } from 'react-router-dom';
import { IconBookOpen, IconRefresh, IconTrash, IconCheck } from '../components/common/Icons.jsx';

export default function CourseManager() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'courses'), orderBy('createdAt', 'desc')));
      setCourses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch {}
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const seedDefault = async () => {
    try {
      await setDoc(doc(db, 'courses', DEFAULT_COURSE.id), {
        ...DEFAULT_COURSE,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      toast.success('Default course seeded.');
      load();
    } catch (err) { toast.error(err?.message || 'Failed.'); }
  };

  const remove = async (c) => {
    const ok = await confirmDialog({ title: `Delete course "${c.title}"?`, body: 'Existing certificates remain valid.', confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    try { await deleteDoc(doc(db, 'courses', c.id)); toast.success('Deleted.'); load(); }
    catch (err) { toast.error(err?.message || 'Failed.'); }
  };

  if (loading) return <LoadingCenter />;

  return (
    <>
      <h1 style={{ marginTop: 0, fontSize: '1.3rem' }}><IconBookOpen size={18} /> Courses</h1>

      <div className="bsdc-flex bsdc-justify-end bsdc-mb-md">
        <button type="button" className="bsdc-btn bsdc-btn--primary" onClick={seedDefault}>
          <IconRefresh size={14} /> Seed default course
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="bsdc-empty">
          <div className="bsdc-empty__title">No courses in Firestore</div>
          <div className="bsdc-empty__body">The bundled default course is served until you seed your own.</div>
        </div>
      ) : (
        <table className="bsdc-admin-table">
          <thead><tr><th>Title</th><th>Slug</th><th>Difficulty</th><th>Reward</th><th>Questions</th><th>Actions</th></tr></thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id}>
                <td><Link to={`/courses/${c.slug || c.id}`}>{c.title}</Link></td>
                <td><code>{c.slug || c.id}</code></td>
                <td><span className="bsdc-chip">{c.difficulty || 'beginner'}</span></td>
                <td>{c.pointsReward || 100}</td>
                <td>{(c.questions || []).length}</td>
                <td>
                  <button type="button" className="bsdc-btn bsdc-btn--ghost bsdc-btn--sm" onClick={() => remove(c)}>
                    <IconTrash size={14} color="#d32f2f" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="bsdc-card bsdc-mt-md" style={{ borderLeft: '4px solid var(--color-primary)' }}>
        <strong>Custom course schema</strong>
        <p className="bsdc-text-sm bsdc-text-muted">
          To add a custom course, create a Firestore document at <code>courses/&lt;slug&gt;</code> with the same shape as the bundled default
          (title, slug, summary, difficulty, durationHours, pointsReward, modules[], questions[], passMark). Once saved, it appears here and at <code>/courses/&lt;slug&gt;</code>.
        </p>
        <p className="bsdc-text-sm">
          <IconCheck size={12} color="#1a6b3a" /> JSON-LD <code>Course</code> schema is emitted automatically.
        </p>
      </div>
    </>
  );
}
