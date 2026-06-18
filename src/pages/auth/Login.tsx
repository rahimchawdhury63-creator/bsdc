import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@components/ui/Button';
import { Card } from '@components/ui/Card';
import { Input } from '@components/ui/Input';
import { SEOHead } from '@components/seo/SEOHead';
import { useAuth } from '@/hooks/useAuth';
import type { AuthProviderId } from '@/services/auth.service';

/** Validation schema for the email/password login form. */
const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  rememberDevice: z.boolean()
});

type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Login page with email/password and OAuth provider sign-in.
 * All successful flows create or update a real Firestore users/{uid} document.
 */
export const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/feed';
  const { signInWithEmail, signInWithProvider, error } = useAuth();
  const [providerLoading, setProviderLoading] = useState<AuthProviderId | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberDevice: true }
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await signInWithEmail(values);
    if (result.ok) {
      navigate(redirect, { replace: true });
    }
  });

  const handleProvider = async (providerId: AuthProviderId) => {
    setProviderLoading(providerId);
    const result = await signInWithProvider(providerId);
    setProviderLoading(null);
    if (result.ok) {
      navigate(redirect, { replace: true });
    }
  };

  return (
    <section className="auth-page" aria-labelledby="login-title">
      <SEOHead title="Login" canonicalPath="/login" noIndex />
      <Card className="auth-card">
        <div className="auth-card__header">
          <h1 id="login-title">Login to BSDC</h1>
          <p className="text-muted">Use your Firebase-backed account to access feed, messages, profile, and community features.</p>
        </div>
        <form className="auth-form" onSubmit={onSubmit} noValidate>
          <Input id="login-email" label="Email address" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
          <Input id="login-password" label="Password" type="password" autoComplete="current-password" error={errors.password?.message} {...register('password')} />
          <label className="checkbox-row">
            <input type="checkbox" {...register('rememberDevice')} />
            <span>Keep me signed in on this device</span>
          </label>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <Button type="submit" isLoading={isSubmitting}>Login</Button>
        </form>
        <div className="auth-divider" role="separator"><span>or continue with</span></div>
        <div className="auth-provider-grid">
          <Button type="button" variant="secondary" icon="shield" isLoading={providerLoading === 'google'} onClick={() => void handleProvider('google')}>Google</Button>
          <Button type="button" variant="secondary" icon="shield" isLoading={providerLoading === 'github'} onClick={() => void handleProvider('github')}>GitHub</Button>
          <Button type="button" variant="secondary" icon="shield" isLoading={providerLoading === 'yahoo'} onClick={() => void handleProvider('yahoo')}>Yahoo</Button>
        </div>
        <p className="auth-card__footer"><Link to="/forgot-password">Forgot password?</Link> <span aria-hidden="true">|</span> <Link to="/register">Create an account</Link></p>
      </Card>
    </section>
  );
};
