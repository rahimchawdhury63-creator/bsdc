import type { BSDCUser } from '@/types';

/** Displays current Firestore point balance from the authenticated profile. */
export const PointsBalance = ({ profile }: { readonly profile: BSDCUser | null }) => <div className="points-balance"><span>Balance</span><strong>{profile?.bsdcPoints ?? 0}</strong><span>BSDC points</span></div>;
