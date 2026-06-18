import { useAuth } from '@/hooks/useAuth';
import { usePoints } from '@/hooks/usePoints';

/** Real transaction history list from Firestore pointTransactions. */
export const TransactionHistory = () => { const { firebaseUser } = useAuth(); const { transactions } = usePoints(firebaseUser?.uid); return <section className="surface-card"><h2>Transaction history</h2>{transactions.length === 0 ? <p className="text-muted">No transactions yet.</p> : transactions.map((tx) => <article className="transaction-row" key={tx.id}><strong>{tx.amount}</strong><span>{tx.description}</span></article>)}</section>; };
