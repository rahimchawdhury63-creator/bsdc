import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/hooks/useAuth';

/** Receive points panel showing the user's UID as QR code. */
export const ReceiveModal = () => { const { firebaseUser } = useAuth(); return <section className="surface-card"><h2>Receive points</h2>{firebaseUser ? <QRCodeSVG value={`bsdc-points:${firebaseUser.uid}`} size={160} /> : <p className="text-muted">Login required.</p>}</section>; };
