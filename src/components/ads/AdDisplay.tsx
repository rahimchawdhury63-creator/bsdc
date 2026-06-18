import type { BSDCAd } from '@/services/ads.service';
/** Displays a real approved advertisement document. */
export const AdDisplay = ({ ad }: { readonly ad: BSDCAd }) => <article className="surface-card"><h2>{ad.title}</h2><p>{ad.content}</p><a href={ad.targetUrl} target="_blank" rel="noreferrer">Visit advertiser</a></article>;
