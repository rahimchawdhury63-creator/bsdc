import { useEffect, useState } from 'react';
import { Button } from '@components/ui/Button';
import { AdminDataTable } from '@components/admin/AdminDataTable';
import { adminReviewVerification, loadAdminVerifications } from '@/services/admin.service';
import { useAuth } from '@/hooks/useAuth';
import type { BSDCVerificationRequest } from '@/services/verification.service';
export const AdminVerificationsPage = () => { const { firebaseUser }=useAuth(); const [rows,setRows]=useState<readonly BSDCVerificationRequest[]>([]); useEffect(()=>{ void loadAdminVerifications().then(r=>{ if(r.ok) setRows(r.data); }); },[]); return <AdminDataTable title="Verifications"><table className="admin-table"><tbody>{rows.map(v=><tr key={v.id}><td>{v.userId}</td><td>{v.status}</td><td><Button type="button" onClick={()=>firebaseUser&&void adminReviewVerification(v.id,firebaseUser.uid,'approved','Approved by admin')}>Approve</Button></td><td><Button type="button" variant="danger" onClick={()=>firebaseUser&&void adminReviewVerification(v.id,firebaseUser.uid,'rejected','Rejected by admin')}>Reject</Button></td></tr>)}</tbody></table></AdminDataTable>; };
