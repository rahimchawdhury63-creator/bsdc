import { useEffect, useState } from 'react';
import { AdminDataTable } from '@components/admin/AdminDataTable';
import { loadAdminCommunities } from '@/services/admin.service';
import type { BSDCCommunity } from '@/types';
export const AdminCommunitiesPage = () => { const [rows,setRows]=useState<readonly BSDCCommunity[]>([]); useEffect(()=>{ void loadAdminCommunities().then(r=>{ if(r.ok) setRows(r.data); }); },[]); return <AdminDataTable title="Communities"><table className="admin-table"><tbody>{rows.map(c=><tr key={c.id}><td>{c.name}</td><td>{c.membersCount}</td></tr>)}</tbody></table></AdminDataTable>; };
