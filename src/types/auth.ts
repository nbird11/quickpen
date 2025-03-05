export interface SerializedUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAnonymous: boolean;
}

export interface AuthState {
  user: SerializedUser | null;
  loading: boolean;
  error: string | null;
}
