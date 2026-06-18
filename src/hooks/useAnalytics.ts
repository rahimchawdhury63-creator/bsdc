import { useEffect, useState } from 'react';
import { subscribeToCreatorStats, type CreatorStats } from '@/services/creator.service';

/** Creator analytics hook using real author post counters. */
export const useAnalytics = (userId?: string) => { const [stats, setStats] = useState<CreatorStats>({ posts: 0, views: 0, likes: 0, comments: 0 }); useEffect(() => userId ? subscribeToCreatorStats(userId, setStats) : undefined, [userId]); return stats; };
