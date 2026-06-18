import { Link } from 'react-router-dom';
import type { BSDCCommunity } from '@/types';

/** Community preview card rendered from real Firestore community documents. */
export const CommunityCard = ({ community }: { readonly community: BSDCCommunity }) => <article className="community-card"><h2><Link to={`/bsdc/${community.slug}`}>{community.name}</Link></h2><p>{community.description}</p><span>{community.membersCount} members</span></article>;
