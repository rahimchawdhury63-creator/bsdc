import { useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
  loginWithEmail,
  loginWithProvider,
  logout,
  registerWithEmail,
  requestPasswordReset,
  resendVerificationEmail,
  type AuthProviderId,
  type LoginWithEmailPayload,
  type RegisterWithEmailPayload
} from '@/services/auth.service';

/**
 * Auth hook exposes Firebase-backed operations with Zustand state.
 * Pages call these methods instead of importing Firebase directly, keeping all
 * auth error normalization and Firestore profile creation in one service layer.
 */
export const useAuth = () => {
  const firebaseUser = useAuthStore((state) => state.firebaseUser);
  const profile = useAuthStore((state) => state.profile);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const hasInitialized = useAuthStore((state) => state.hasInitialized);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setError = useAuthStore((state) => state.setError);
  const reset = useAuthStore((state) => state.reset);

  const signInWithEmail = useCallback(async (payload: LoginWithEmailPayload) => {
    setLoading(true);
    const result = await loginWithEmail(payload);
    if (!result.ok) {
      setError(result.error);
    }
    return result;
  }, [setError, setLoading]);

  const signUpWithEmail = useCallback(async (payload: RegisterWithEmailPayload) => {
    setLoading(true);
    const result = await registerWithEmail(payload);
    if (!result.ok) {
      setError(result.error);
    }
    return result;
  }, [setError, setLoading]);

  const signInWithProvider = useCallback(async (providerId: AuthProviderId) => {
    setLoading(true);
    const result = await loginWithProvider(providerId);
    if (!result.ok) {
      setError(result.error);
    }
    return result;
  }, [setError, setLoading]);

  const sendPasswordReset = useCallback(async (email: string) => {
    setLoading(true);
    const result = await requestPasswordReset(email);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
    }
    return result;
  }, [setError, setLoading]);

  const sendVerificationEmail = useCallback(async () => {
    setLoading(true);
    const result = await resendVerificationEmail();
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
    }
    return result;
  }, [setError, setLoading]);

  const signOut = useCallback(async () => {
    setLoading(true);
    const result = await logout();
    if (result.ok) {
      reset();
    } else {
      setError(result.error);
    }
    return result;
  }, [reset, setError, setLoading]);

  return {
    firebaseUser,
    profile,
    isAuthenticated,
    isLoading,
    error,
    hasInitialized,
    signInWithEmail,
    signUpWithEmail,
    signInWithProvider,
    sendPasswordReset,
    sendVerificationEmail,
    signOut
  };
};
