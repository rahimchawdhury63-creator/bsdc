import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToUserVerifications, type BSDCVerificationRequest } from '@/services/verification.service';

/** Shows authenticated user's real verification applications. */
export const VerificationStatus = () => { const { firebaseUser } = useAuth(); const [items, setItems] = useState<readonly BSDCVerificationRequest[]>([]); useEffect(() => firebaseUser ? subscribeToUserVerifications(firebaseUser.uid, setItems) : undefined, [firebaseUser]); return <section className="surface-card"><h2>Status</h2>{items.length === 0 ? <p className="text-muted">No verification requests yet.</p> : items.map((item) => <article className="transaction-row" key={item.id}><strong>{item.status}</strong><span>{item.idType}</span></article>)}</section>; };
