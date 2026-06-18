import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
/** Creator dashboard from real post counters. */
export const CreatorDashboard = () => { const { firebaseUser }=useAuth(); const stats=useAnalytics(firebaseUser?.uid); return <section className="surface-card"><h1>Creator dashboard</h1><dl className="profile-stats"><div><dt>Posts</dt><dd>{stats.posts}</dd></div><div><dt>Views</dt><dd>{stats.views}</dd></div><div><dt>Likes</dt><dd>{stats.likes}</dd></div><div><dt>Comments</dt><dd>{stats.comments}</dd></div></dl></section>; };
