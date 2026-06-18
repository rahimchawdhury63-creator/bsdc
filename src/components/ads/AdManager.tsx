import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToUserAds, type BSDCAd } from '@/services/ads.service';
/** Lists authenticated user's real ad requests. */
export const AdManager = () => { const { firebaseUser }=useAuth(); const [ads,setAds]=useState<readonly BSDCAd[]>([]); useEffect(()=>firebaseUser?subscribeToUserAds(firebaseUser.uid,setAds):undefined,[firebaseUser]); return <section className="surface-card"><h1>My ads</h1>{ads.length===0?<p className="text-muted">No ads yet.</p>:ads.map(ad=><article className="transaction-row" key={ad.id}><strong>{ad.title}</strong><span>{ad.status}</span></article>)}</section>; };
