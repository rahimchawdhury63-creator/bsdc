import { useState } from 'react';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { createAd } from '@/services/ads.service';

/** Ad request form using BSDC points and real Firestore ads collection. */
export const AdCreator = () => { const { firebaseUser } = useAuth(); const [title,setTitle]=useState(''); const [content,setContent]=useState(''); const [targetUrl,setTargetUrl]=useState(''); const [message,setMessage]=useState<string|null>(null); const submit=async()=>{ if(!firebaseUser)return; const result=await createAd({ advertiserId: firebaseUser.uid, title, content, imageUrl:'', targetUrl, pointsCost:100 }); setMessage(result.ok?'Ad submitted for approval.':result.error); }; return <section className="surface-card"><h1>Create ad</h1><Input id="ad-title" label="Title" value={title} onChange={(e)=>setTitle(e.target.value)} /><Input id="ad-content" label="Content" value={content} onChange={(e)=>setContent(e.target.value)} /><Input id="ad-url" label="Target URL" value={targetUrl} onChange={(e)=>setTargetUrl(e.target.value)} /><Button type="button" onClick={()=>void submit()}>Submit ad</Button>{message?<p className="form-helper">{message}</p>:null}</section>; };
