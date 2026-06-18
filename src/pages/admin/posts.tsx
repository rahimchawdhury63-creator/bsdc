import { useEffect, useState } from 'react';
import { Button } from '@components/ui/Button';
import { AdminDataTable } from '@components/admin/AdminDataTable';
import { adminDeletePost, loadAdminPosts } from '@/services/admin.service';
import type { BSDCPost } from '@/types';
export const AdminPostsPage = () => { const [rows,setRows]=useState<readonly BSDCPost[]>([]); useEffect(()=>{ void loadAdminPosts().then(r=>{ if(r.ok) setRows(r.data); }); },[]); return <AdminDataTable title="Posts"><table className="admin-table"><tbody>{rows.map(p=><tr key={p.id}><td>{p.title}</td><td>{p.type}</td><td><Button type="button" variant="danger" onClick={()=>void adminDeletePost(p.id)}>Delete</Button></td></tr>)}</tbody></table></AdminDataTable>; };
