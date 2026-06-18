import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Spinner } from '@components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';

/**
 * Protects private routes by requiring a real Firebase Auth session.
 * The current URL is preserved so users can return after successful login.
 */
export const ProtectedRoute = () => {
  const { isAuthenticated, hasInitialized, isLoading } = useAuth();
  const location = useLocation();

  if (!hasInitialized || isLoading) {
    return <div className="route-loader"><Spinner /></div>;
  }

  if (!isAuthenticated) {
    const redirectTo = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirectTo)}`} replace />;
  }

  return <Outlet />;
};
