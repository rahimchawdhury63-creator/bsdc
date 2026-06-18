import { useEffect, useState } from 'react';
import { createCommunity, subscribeToCommunities, toggleCommunityMembership, type CreateCommunityPayload } from '@/services/community.service';
import type { BSDCCommunity } from '@/types';

/** Hook for community list, creation, and join/leave operations. */
export const useCommunity = () => {
  const [communities, setCommunities] = useState<readonly BSDCCommunity[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => subscribeToCommunities(setCommunities), []);

  const create = async (payload: CreateCommunityPayload) => {
    const result = await createCommunity(payload);
    if (!result.ok) {
      setError(result.error);
      return null;
    }
    setError(null);
    return result.data;
  };

  const toggleMembership = async (communityId: string, userId: string) => {
    const result = await toggleCommunityMembership(communityId, userId);
    if (!result.ok) {
      setError(result.error);
      return null;
    }
    return result.data;
  };

  return { communities, error, create, toggleMembership };
};
