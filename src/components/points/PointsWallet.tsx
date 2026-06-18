import { useAuth } from '@/hooks/useAuth';
import { PointsBalance } from './PointsBalance';
import { TransferModal } from './TransferModal';
import { QRTransfer } from './QRTransfer';
import { TransactionHistory } from './TransactionHistory';
import { EarningRules } from './EarningRules';

/** BSDC wallet page composition. */
export const PointsWallet = () => { const { profile } = useAuth(); return <div className="wallet-grid"><PointsBalance profile={profile} /><TransferModal /><QRTransfer /><TransactionHistory /><EarningRules /></div>; };
