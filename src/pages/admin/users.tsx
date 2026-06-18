import { useEffect, useState } from 'react';
import { Button } from '@components/ui/Button';
import { AdminDataTable } from '@components/admin/AdminDataTable';
import { loadAdminUsers, updateUserRole } from '@/services/admin.service';
import type { BSDCUser } from '@/types';
export const AdminUsersPage = () => { const [rows,setRows]=useState<readonly BSDCUser[]>([]); useEffect(()=>{ void loadAdminUsers().then(r=>{ if(r.ok) setRows(r.data); }); },[]); return <AdminDataTable title="Users"><table className="admin-table"><tbody>{rows.map(u=><tr key={u.uid}><td>{u.email}</td><td>{u.role}</td><td><Button type="button" variant="secondary" onClick={()=>void updateUserRole(u.uid,'moderator')}>Make moderator</Button></td></tr>)}</tbody></table></AdminDataTable>; };
