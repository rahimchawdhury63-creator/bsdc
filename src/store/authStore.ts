import { create } from 'zustand';
import type { User } from 'firebase/auth';
import type { BSDCUser } from '@/types';

/** Auth store state shared across route guards, navigation, and auth pages. */
interface AuthStoreState {
  readonly firebaseUser: User | null;
  readonly profile: BSDCUser | null;
  readonly isAuthenticated: boolean;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly hasInitialized: boolean;
  readonly setAuthState: (firebaseUser: User | null, profile: BSDCUser | null) => void;
  readonly setLoading: (isLoading: boolean) => void;
  readonly setError: (error: string | null) => void;
  readonly reset: () => void;
}

/** Zustand auth store intentionally contains no fake data or cached credentials. */
export const useAuthStore = create<AuthStoreState>((set) => ({
  firebaseUser: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  hasInitialized: false,
  setAuthState: (firebaseUser, profile) =>
    set({
      firebaseUser,
      profile,
      isAuthenticated: firebaseUser !== null,
      isLoading: false,
      error: null,
      hasInitialized: true
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false, hasInitialized: true }),
  reset: () =>
    set({
      firebaseUser: null,
      profile: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      hasInitialized: true
    })
}));
