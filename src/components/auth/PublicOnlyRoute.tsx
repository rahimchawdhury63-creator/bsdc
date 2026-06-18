import { Navigate, Outlet, useSearchParams } from 'react-router-dom';
import { Spinner } from '@components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';

/** Redirects signed-in users away from login/register pages. */
export const PublicOnlyRoute = () => {
  const { isAuthenticated, hasInitialized, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/feed';

  if (!hasInitialized || isLoading) {
    return <div className="route-loader"><Spinner /></div>;
  }

  return isAuthenticated ? <Navigate to={redirect} replace /> : <Outlet />;
};
