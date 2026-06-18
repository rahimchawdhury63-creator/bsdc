/** Admin section identifiers used by protected admin routing and navigation. */
export type AdminSection =
  | 'dashboard'
  | 'users'
  | 'posts'
  | 'communities'
  | 'verifications'
  | 'monetization'
  | 'ads'
  | 'analytics'
  | 'notifications'
  | 'broadcast'
  | 'points'
  | 'courses'
  | 'navigation'
  | 'settings'
  | 'reports'
  | 'bulk-export'
  | 'passkey';

/** Small typed analytics card model for the admin dashboard. */
export interface AdminMetricCard {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly changePercent: number;
}
