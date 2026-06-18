import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getCourseById, type BSDCCourse } from '@/services/course.service';
import { JsonLdSchema } from '@components/seo/JsonLdSchema';
import { courseSchema } from '@/utils/schema.utils';
/** Long-form course content page. */
export const CoursePage = () => { const { id }=useParams(); const [course,setCourse]=useState<BSDCCourse|null>(null); useEffect(()=>{ if(id) void getCourseById(id).then((r)=>{ if(r.ok) setCourse(r.data); }); },[id]); if(!course) return <section className="surface-card"><h1>Course not found</h1></section>; return <article className="surface-card"><JsonLdSchema id="course-schema" schema={courseSchema(course.title, course.description, `/courses/${course.id}`)} /><h1>{course.title}</h1><p className="text-muted">{course.level} • {course.estimatedTime}</p><p>{course.description}</p><div className="post-detail__content">{course.content}</div><Link className="button button--primary" to={`/courses/exam/${course.id}`}>Take exam</Link></article>; };
