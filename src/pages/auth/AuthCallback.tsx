import { Link } from 'react-router-dom';
import { Card } from '@components/ui/Card';
import { Spinner } from '@components/ui/Spinner';
import { SEOHead } from '@components/seo/SEOHead';
import { useAuth } from '@/hooks/useAuth';

/** OAuth callback placeholder for providers that return to the SPA shell. */
export const AuthCallback = () => {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <section className="auth-page" aria-labelledby="callback-title">
      <SEOHead title="Authentication callback" canonicalPath="/auth/callback" noIndex />
      <Card className="auth-card">
        <div className="auth-card__header">
          <h1 id="callback-title">Completing sign in</h1>
          <p className="text-muted">Firebase is finalizing your authentication session.</p>
        </div>
        {isLoading ? <Spinner /> : isAuthenticated ? <Link className="button button--primary" to="/feed">Continue</Link> : <Link className="button button--primary" to="/login">Return to login</Link>}
      </Card>
    </section>
  );
};
