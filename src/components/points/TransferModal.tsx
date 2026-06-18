import { useState } from 'react';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { usePoints } from '@/hooks/usePoints';

/** bKash-like point transfer form using real Firestore transactions. */
export const TransferModal = () => {
  const { firebaseUser } = useAuth();
  const { transfer, error } = usePoints(firebaseUser?.uid);
  const [toUserId, setToUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    if (!firebaseUser) return;
    const ok = await transfer({ fromUserId: firebaseUser.uid, toUserId, amount: Number(amount), description: 'BSDC wallet transfer' });
    setMessage(ok ? 'Transfer completed.' : null);
  };

  return <section className="surface-card"><h2>Send points</h2><div className="auth-form"><Input id="to-user-id" label="Receiver user ID" value={toUserId} onChange={(event) => setToUserId(event.target.value)} /><Input id="point-amount" label="Amount" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} /><Button type="button" onClick={() => void submit()}>Send points</Button>{message ? <p className="form-success">{message}</p> : null}{error ? <p className="form-error">{error}</p> : null}</div></section>;
};
