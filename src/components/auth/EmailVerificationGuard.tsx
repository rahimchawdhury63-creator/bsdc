import { Navigate, Outlet } from 'react-router-dom';
import { Spinner } from '@components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';

/**
 * Optional guard for routes that require verified email accounts.
 * OAuth providers often return verified emails automatically; email/password
 * users are sent to the verification instructions page until Firebase updates.
 */
export const EmailVerificationGuard = () => {
  const { firebaseUser, hasInitialized, isLoading } = useAuth();

  if (!hasInitialized || isLoading) {
    return <div className="route-loader"><Spinner /></div>;
  }

  if (firebaseUser && !firebaseUser.emailVerified) {
    return <Navigate to="/email-verify" replace />;
  }

  return <Outlet />;
};
