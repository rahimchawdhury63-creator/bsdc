import { addDoc, collection, doc, getDoc, getDocs, increment, limit, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '@config/firebase';
import { FIRESTORE_COLLECTIONS, SITE_URL } from '@config/constants';
import type { ServiceResult } from '@/types';

/** MCQ option stored in a course exam question. */
export interface MCQOption { readonly id: string; readonly label: string; }
/** MCQ question stored inside a Firestore course document. */
export interface MCQQuestion { readonly id: string; readonly question: string; readonly options: readonly MCQOption[]; readonly correctOptionId: string; }
/** Firestore course document used by catalog, content, and exam pages. */
export interface BSDCCourse { readonly id: string; readonly title: string; readonly slug: string; readonly description: string; readonly content: string; readonly category: string; readonly level: string; readonly estimatedTime: string; readonly exam: { readonly questions: readonly MCQQuestion[]; readonly passingScore: number }; readonly createdBy: string; readonly enrolledCount: number; readonly createdAt: unknown; }
/** Certificate document generated after a passing exam score. */
export interface BSDCCertificate { readonly id: string; readonly userId: string; readonly courseId: string; readonly score: number; readonly passed: boolean; readonly certificateNumber: string; readonly qrCode: string; readonly issuedAt: unknown; readonly verificationUrl: string; }

/** Maps a course Firestore snapshot into a strict course model. */
const mapCourse = (id: string, data: Record<string, unknown>): BSDCCourse => ({ id, title: String(data.title || ''), slug: String(data.slug || id), description: String(data.description || ''), content: String(data.content || ''), category: String(data.category || ''), level: String(data.level || ''), estimatedTime: String(data.estimatedTime || ''), exam: (data.exam || { questions: [], passingScore: 80 }) as BSDCCourse['exam'], createdBy: String(data.createdBy || ''), enrolledCount: Number(data.enrolledCount || 0), createdAt: data.createdAt });

/** Loads latest real courses from Firestore. */
export const getCourses = async (): Promise<ServiceResult<readonly BSDCCourse[]>> => { try { const snap = await getDocs(query(collection(db, FIRESTORE_COLLECTIONS.courses), orderBy('createdAt', 'desc'), limit(50))); return { ok: true, data: snap.docs.map((d) => mapCourse(d.id, d.data())) }; } catch (error) { return { ok: false, error: error instanceof Error ? error.message : 'Unable to load courses.' }; } };
/** Loads one real course by Firestore id. */
export const getCourseById = async (courseId: string): Promise<ServiceResult<BSDCCourse | null>> => { try { const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.courses, courseId)); return { ok: true, data: snap.exists() ? mapCourse(snap.id, snap.data()) : null }; } catch (error) { return { ok: false, error: error instanceof Error ? error.message : 'Unable to load course.' }; } };
/** Scores an exam answer map against course questions. */
export const scoreExam = (course: BSDCCourse, answers: Record<string, string>): { score: number; passed: boolean } => { const total = course.exam.questions.length || 1; const correct = course.exam.questions.filter((question) => answers[question.id] === question.correctOptionId).length; const score = Math.round((correct / total) * 100); return { score, passed: score >= course.exam.passingScore }; };
/** Creates a certificate after a passing exam result. */
export const createCertificate = async (userId: string, courseId: string, score: number, passed: boolean): Promise<ServiceResult<string>> => { try { const certificateNumber = `BSDC-${courseId.slice(0, 6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`; const verificationUrl = `${SITE_URL}/courses/certificate/${certificateNumber}`; const ref = await addDoc(collection(db, FIRESTORE_COLLECTIONS.certificates), { userId, courseId, score, passed, certificateNumber, qrCode: verificationUrl, verificationUrl, issuedAt: serverTimestamp() }); await updateDoc(doc(db, FIRESTORE_COLLECTIONS.courses, courseId), { enrolledCount: increment(1) }); return { ok: true, data: ref.id }; } catch (error) { return { ok: false, error: error instanceof Error ? error.message : 'Unable to create certificate.' }; } };
/** Resolves certificate by public certificate number. */
export const getCertificateByNumber = async (certificateNumber: string): Promise<ServiceResult<BSDCCertificate | null>> => { try { const snap = await getDocs(query(collection(db, FIRESTORE_COLLECTIONS.certificates), where('certificateNumber', '==', certificateNumber), limit(1))); if (snap.empty) return { ok: true, data: null }; const d = snap.docs[0]!; return { ok: true, data: { id: d.id, ...d.data() } as BSDCCertificate }; } catch (error) { return { ok: false, error: error instanceof Error ? error.message : 'Unable to load certificate.' }; } };
