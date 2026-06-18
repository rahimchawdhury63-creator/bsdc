import { useEffect, useState } from 'react';
import { Button } from '@components/ui/Button';
import { AdminDataTable } from '@components/admin/AdminDataTable';
import { adminUpdateAdStatus, loadAdminAds } from '@/services/admin.service';
import type { BSDCAd } from '@/services/ads.service';
export const AdminAdsPage = () => { const [rows,setRows]=useState<readonly BSDCAd[]>([]); useEffect(()=>{ void loadAdminAds().then(r=>{ if(r.ok) setRows(r.data); }); },[]); return <AdminDataTable title="Ads"><table className="admin-table"><tbody>{rows.map(a=><tr key={a.id}><td>{a.title}</td><td>{a.status}</td><td><Button type="button" onClick={()=>void adminUpdateAdStatus(a.id,'active')}>Activate</Button></td></tr>)}</tbody></table></AdminDataTable>; };
