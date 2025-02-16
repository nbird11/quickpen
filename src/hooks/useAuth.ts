import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { serializeUser } from '../services/auth';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setUser, setError } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector(state => state.auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth,
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