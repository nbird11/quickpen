import React from 'react';
import { useEffect } from 'react';
import { auth } from '../services/firebase';
import { useAppDispatch } from '../store/hooks';
import { setUser, setLoading } from '../store/slices/authSlice';
import type { User } from 'firebase/auth';
import type { SerializedUser } from '../types/auth';

function serializeUser(user: User | null): SerializedUser | null {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    isAnonymous: user.isAnonymous,
  };
}

export function AuthListener({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      dispatch(setUser(serializeUser(user)));
      dispatch(setLoading(false));
    });

    return unsubscribe;
  }, [dispatch]);

  return <>{children}</>;
}