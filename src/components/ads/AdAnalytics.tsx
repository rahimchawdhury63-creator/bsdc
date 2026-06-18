import type { BSDCAd } from '@/services/ads.service';
/** Shows real ad counters from Firestore. */
export const AdAnalytics = ({ ad }: { readonly ad: BSDCAd }) => <dl className="profile-stats"><div><dt>Impressions</dt><dd>{ad.impressions}</dd></div><div><dt>Clicks</dt><dd>{ad.clicks}</dd></div></dl>;
