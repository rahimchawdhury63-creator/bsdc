import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCourses, type BSDCCourse } from '@/services/course.service';
/** Course catalog rendered from real Firestore courses collection. */
export const CourseList = () => { const [courses,setCourses]=useState<readonly BSDCCourse[]>([]); const [error,setError]=useState<string|null>(null); useEffect(()=>{ void getCourses().then((r)=>r.ok?setCourses(r.data):setError(r.error)); },[]); return <section className="surface-card"><h1>Courses</h1>{error?<p className="form-error">{error}</p>:null}{courses.length===0?<p className="text-muted">No courses have been published yet.</p>:courses.map((course)=><article className="transaction-row" key={course.id}><Link to={`/courses/${course.id}`}>{course.title}</Link><span>{course.level}</span></article>)}</section>; };
