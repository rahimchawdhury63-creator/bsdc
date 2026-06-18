import { SEOHead } from '@components/seo/SEOHead';
import { PointsWallet } from '@components/points/PointsWallet';

/** BSDC points wallet page. */
export const WalletPage = () => <><SEOHead title="BSDC Wallet" canonicalPath="/points/wallet" noIndex /><PointsWallet /></>;
