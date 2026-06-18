import { useEffect, useState } from 'react';
import { hasAdminPasskeySession, loadAdminMetrics } from '@/services/admin.service';
import type { AdminMetricCard } from '@/types';

/** Admin dashboard metrics hook. */
export const useAdminMetrics = () => {
  const [metrics, setMetrics] = useState<readonly AdminMetricCard[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void loadAdminMetrics().then((result) => result.ok ? setMetrics(result.data) : setError(result.error)); }, []);
  return { metrics, error, hasPasskey: hasAdminPasskeySession() };
};
