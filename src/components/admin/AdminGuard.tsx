import { Navigate, Outlet } from 'react-router-dom';
import { hasAdminPasskeySession } from '@/services/admin.service';
import { useAuth } from '@/hooks/useAuth';

/** UI-level admin guard combining Firebase role and passkey session. Firestore rules remain the final authority. */
export const AdminGuard = () => {
  const { profile, isAuthenticated, hasInitialized } = useAuth();
  if (!hasInitialized) return <section className="surface-card"><p>Loading admin session</p></section>;
  if (!isAuthenticated) return <Navigate to="/login?redirect=/admin" replace />;
  const hasRole = profile?.role === 'admin' || profile?.role === 'super_admin';
  if (!hasRole) return <section className="surface-card"><h1>Admin access required</h1><p className="text-muted">Your Firestore role must be admin or super_admin.</p></section>;
  if (!hasAdminPasskeySession()) return <Navigate to="/admin/passkey" replace />;
  return <Outlet />;
};
