import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SEOHead } from '@components/seo/SEOHead';
import { CommunityFeed } from '@components/community/CommunityFeed';
import { CommunityHeader } from '@components/community/CommunityHeader';
import { CommunityRules } from '@components/community/CommunityRules';
import { getCommunityBySlug } from '@/services/community.service';
import type { BSDCCommunity } from '@/types';

/** Community detail page resolved by slug. */
export const CommunityPage = () => { const { name } = useParams(); const [community, setCommunity] = useState<BSDCCommunity | null>(null); useEffect(() => { if (name) void getCommunityBySlug(name).then((result) => { if (result.ok) setCommunity(result.data); }); }, [name]); if (!community) return <section className="surface-card"><h1>Community not found</h1></section>; return <><SEOHead title={`${community.name} Community`} canonicalPath={`/bsdc/${community.slug}`} /><div className="community-page"><CommunityHeader community={community} /><CommunityRules rules={community.rules} /><CommunityFeed /></div></>; };
