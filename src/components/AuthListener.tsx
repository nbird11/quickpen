import { useEffect } from 'react';
import { auth } from '../services/firebase';
import { useAppDispatch } from '../store/hooks';
import { setUser, setLoading } from '../store/slices/authSlice';

export function AuthListener({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      dispatch(setUser(user));
      dispatch(setLoading(false));
    });

    return unsubscribe;
  }, [dispatch]);

  return <>{children}</>;
}