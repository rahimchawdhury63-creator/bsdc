import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@components/ui/Button';
import { Card } from '@components/ui/Card';
import { SEOHead } from '@components/seo/SEOHead';
import { useAuth } from '@/hooks/useAuth';

/** Email verification instructions and resend action for Firebase Auth users. */
export const EmailVerify = () => {
  const { firebaseUser, sendVerificationEmail, signOut } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleResend = async () => {
    setIsSending(true);
    const result = await sendVerificationEmail();
    setIsSending(false);
    setMessage(result.ok ? 'Verification email sent. Check your inbox and spam folder.' : result.error);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <section className="auth-page" aria-labelledby="verify-title">
      <SEOHead title="Verify email" canonicalPath="/email-verify" noIndex />
      <Card className="auth-card">
        <div className="auth-card__header">
          <h1 id="verify-title">Verify your email</h1>
          <p className="text-muted">BSDC uses Firebase email verification to protect accounts and community trust.</p>
        </div>
        {firebaseUser?.emailVerified ? (
          <div className="auth-form">
            <p className="form-success">Your email is verified.</p>
            <Link className="button button--primary" to="/feed">Continue to feed</Link>
          </div>
        ) : (
          <div className="auth-form">
            <p>A verification email was sent to <strong>{firebaseUser?.email || 'your account email'}</strong>.</p>
            {message ? <p className={message.includes('sent') ? 'form-success' : 'form-error'} role="status">{message}</p> : null}
            <Button type="button" isLoading={isSending} onClick={() => void handleResend()}>Resend verification email</Button>
            <Button type="button" variant="ghost" onClick={() => void handleSignOut()}>Sign out</Button>
          </div>
        )}
      </Card>
    </section>
  );
};
