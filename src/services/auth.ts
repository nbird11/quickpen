import firebase, { auth } from './firebase';
import { SerializedUser } from '../types/auth';

export const serializeUser = (user: firebase.User | null): SerializedUser | null => {
  if (!user) return null;

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    isAnonymous: user.isAnonymous
  };
};

export const authService = {
  signOut: async (): Promise<void> => {
    return auth.signOut();
  }
};