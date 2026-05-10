import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import {
  auth,
  db,
  createUserProfile,
  getUserProfile,
  onAuthStateChanged,
  signInWithGoogle,
  signInWithGithub,
  signInWithYahoo,
  signInWithApple,
  signInEmail,
  registerEmail,
  logOut,
} from './firebase';
import { doc, updateDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await createUserProfile(firebaseUser);
        const prof = await getUserProfile(firebaseUser.uid);
        setProfile(prof);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const prof = await getUserProfile(user.uid);
      setProfile(prof);
    }
  }, [user]);

  const updateUserProfile = useCallback(async (data) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), data);
    await refreshProfile();
  }, [user, refreshProfile]);

  const loginWithGoogle = async () => {
    const result = await signInWithGoogle();
    await createUserProfile(result.user);
  };

  const loginWithGithub = async () => {
    const result = await signInWithGithub();
    await createUserProfile(result.user);
  };

  const loginWithYahoo = async () => {
    const result = await signInWithYahoo();
    await createUserProfile(result.user);
  };

  const loginWithApple = async () => {
    const result = await signInWithApple();
    await createUserProfile(result.user);
  };

  const loginWithEmail = async (email, password) => {
    return signInEmail(email, password);
  };

  const register = async (email, password, displayName) => {
    const result = await registerEmail(email, password, displayName);
    await createUserProfile(result.user, { displayName });
    return result;
  };

  const logout = async () => {
    await logOut();
  };

  const value = {
    user,
    profile,
    loading,
    refreshProfile,
    updateUserProfile,
    loginWithGoogle,
    loginWithGithub,
    loginWithYahoo,
    loginWithApple,
    loginWithEmail,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
