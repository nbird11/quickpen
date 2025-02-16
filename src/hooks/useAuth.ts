import { useEffect } from 'react';
import { auth } from '../services/firebase';
import { serializeUser } from '../services/auth';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setUser, setError } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector(state => state.auth);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      (user) => {
        dispatch(setUser(serializeUser(user)));
      },
      (error) => {
        dispatch(setError(error.message));
      }
    );

    return () => unsubscribe();
  }, [dispatch]);

  return { user, loading, error };
};