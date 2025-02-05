import { signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from './firebase';

export const authService = {
  signOut: async (): Promise<void> => {
    return firebaseSignOut(auth);
  }
};