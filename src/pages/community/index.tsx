import { SEOHead } from '@components/seo/SEOHead';
import { CommunityCard } from '@components/community/CommunityCard';
import { CreateCommunity } from '@components/community/CreateCommunity';
import { useCommunity } from '@/hooks/useCommunity';

/** Public communities listing from Firestore. */
export const CommunitiesPage = () => { const { communities } = useCommunity(); return <><SEOHead title="Communities" canonicalPath="/communities" /><div className="community-grid"><CreateCommunity />{communities.length === 0 ? <section className="surface-card"><p className="text-muted">No communities yet.</p></section> : communities.map((community) => <CommunityCard community={community} key={community.id} />)}</div></>; };
