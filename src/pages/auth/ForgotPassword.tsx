import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@components/ui/Button';
import { Card } from '@components/ui/Card';
import { Input } from '@components/ui/Input';
import { SEOHead } from '@components/seo/SEOHead';
import { useAuth } from '@/hooks/useAuth';

/** Password reset form validation schema. */
const forgotPasswordSchema = z.object({ email: z.string().email('Enter a valid email address.') });

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

/** Sends Firebase password reset email for the provided account address. */
export const ForgotPassword = () => {
  const { sendPasswordReset, error } = useAuth();
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: '' } });

  const onSubmit = handleSubmit(async ({ email }) => {
    const result = await sendPasswordReset(email);
    if (result.ok) {
      setSuccess(true);
    }
  });

  return (
    <section className="auth-page" aria-labelledby="forgot-title">
      <SEOHead title="Forgot password" canonicalPath="/forgot-password" noIndex />
      <Card className="auth-card">
        <div className="auth-card__header">
          <h1 id="forgot-title">Reset password</h1>
          <p className="text-muted">Firebase will send reset instructions to your account email address.</p>
        </div>
        <form className="auth-form" onSubmit={onSubmit} noValidate>
          <Input id="forgot-email" label="Email address" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
          {success ? <p className="form-success" role="status">If the email belongs to a BSDC account, reset instructions have been sent.</p> : null}
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <Button type="submit" isLoading={isSubmitting}>Send reset email</Button>
        </form>
        <p className="auth-card__footer"><Link to="/login">Return to login</Link></p>
      </Card>
    </section>
  );
};
