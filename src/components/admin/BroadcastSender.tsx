import { useState } from 'react';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { createAdminBroadcast } from '@/services/admin.service';

/** Broadcast request creator. Cloud Functions should process queued broadcasts and OneSignal pushes. */
export const BroadcastSender = () => { const { firebaseUser }=useAuth(); const [title,setTitle]=useState(''); const [message,setMessage]=useState(''); const [status,setStatus]=useState<string|null>(null); const submit=async()=>{ if(!firebaseUser)return; const result=await createAdminBroadcast(firebaseUser.uid,title,message); setStatus(result.ok?'Broadcast queued.':result.error); }; return <section className="admin-card"><h1>Broadcast</h1><Input id="broadcast-title" label="Title" value={title} onChange={(e)=>setTitle(e.target.value)} /><textarea className="form-input" rows={6} value={message} onChange={(e)=>setMessage(e.target.value)} /><Button type="button" onClick={()=>void submit()}>Queue broadcast</Button>{status?<p className="form-helper">{status}</p>:null}</section>; };
