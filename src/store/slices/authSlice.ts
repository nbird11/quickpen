import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SerializedUser, AuthState } from '../../types/auth';

const initialState: AuthState = {
  user: null,
  loading: true,
  error: null
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<SerializedUser | null>) => {
      state.user = action.payload;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

export const { setUser, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
