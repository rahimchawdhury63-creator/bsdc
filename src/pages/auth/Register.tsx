import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@components/ui/Button';
import { Card } from '@components/ui/Card';
import { Input } from '@components/ui/Input';
import { SEOHead } from '@components/seo/SEOHead';
import { useAuth } from '@/hooks/useAuth';

/** Registration validation schema with explicit consent confirmation. */
const registerSchema = z
  .object({
    displayName: z.string().min(2, 'Display name must be at least 2 characters.').max(80, 'Display name is too long.'),
    email: z.string().email('Enter a valid email address.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(8, 'Confirm your password.'),
    language: z.enum(['bn', 'en']),
    acceptRules: z.boolean().refine((value) => value, 'You must accept the community account rules.')
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword']
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

/**
 * Registration page for real Firebase email/password accounts.
 * After account creation, Firebase sends an email verification message and the
 * Firestore profile is created with normal user role and zero starting counters.
 */
export const Register = () => {
  const navigate = useNavigate();
  const { signUpWithEmail, error } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { displayName: '', email: '', password: '', confirmPassword: '', language: 'bn', acceptRules: false }
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await signUpWithEmail({
      displayName: values.displayName,
      email: values.email,
      password: values.password,
      language: values.language
    });

    if (result.ok) {
      navigate('/email-verify', { replace: true });
    }
  });

  return (
    <section className="auth-page" aria-labelledby="register-title">
      <SEOHead title="Register" canonicalPath="/register" noIndex />
      <Card className="auth-card">
        <div className="auth-card__header">
          <h1 id="register-title">Create BSDC account</h1>
          <p className="text-muted">Join with a real Firebase account and build your public developer identity.</p>
        </div>
        <form className="auth-form" onSubmit={onSubmit} noValidate>
          <Input id="register-name" label="Display name" type="text" autoComplete="name" error={errors.displayName?.message} {...register('displayName')} />
          <Input id="register-email" label="Email address" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
          <Input id="register-password" label="Password" type="password" autoComplete="new-password" helperText="Use at least 8 characters." error={errors.password?.message} {...register('password')} />
          <Input id="register-confirm-password" label="Confirm password" type="password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
          <div className="form-field">
            <label className="form-label" htmlFor="register-language">Preferred language</label>
            <select className="form-input" id="register-language" {...register('language')}>
              <option value="bn">Bangla</option>
              <option value="en">English</option>
            </select>
          </div>
          <label className="checkbox-row">
            <input type="checkbox" {...register('acceptRules')} />
            <span>I agree to use BSDC respectfully and follow community safety rules.</span>
          </label>
          {errors.acceptRules?.message ? <p className="form-error">{errors.acceptRules.message}</p> : null}
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <Button type="submit" isLoading={isSubmitting}>Create account</Button>
        </form>
        <p className="auth-card__footer">Already have an account? <Link to="/login">Login</Link></p>
      </Card>
    </section>
  );
};
