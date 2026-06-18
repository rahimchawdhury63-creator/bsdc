import { Button } from '@components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useCommunity } from '@/hooks/useCommunity';
import type { BSDCCommunity } from '@/types';

/** Community page header with join/leave action. */
export const CommunityHeader = ({ community }: { readonly community: BSDCCommunity }) => { const { firebaseUser } = useAuth(); const { toggleMembership } = useCommunity(); return <header className="community-header"><h1>{community.name}</h1><p>{community.description}</p>{firebaseUser ? <Button type="button" onClick={() => void toggleMembership(community.id, firebaseUser.uid)}>Join or leave</Button> : null}</header>; };
