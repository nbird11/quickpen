import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ThemePreference = 'light' | 'dark' | 'system';
type ActiveTheme = 'light' | 'dark';

interface ThemeState {
  preferredTheme: ThemePreference;
  activeTheme: ActiveTheme;
}

const getInitialSystemTheme = (): ActiveTheme => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light'; // Default if window/matchMedia is not available (e.g., SSR)
};

const getInitialPreferredTheme = (): ThemePreference => {
  if (typeof localStorage !== 'undefined') {
    const storedTheme = localStorage.getItem('theme') as ThemePreference | null;
    if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
      return storedTheme;
    }
  }
  return 'system'; // Default to system preference
};

const calculateActiveTheme = (preferred: ThemePreference, system: ActiveTheme): ActiveTheme => {
  if (preferred === 'system') {
    return system;
  }
  return preferred;
};

const initialSystemTheme = getInitialSystemTheme();
const initialPreferredTheme = getInitialPreferredTheme();

const initialState: ThemeState = {
  preferredTheme: initialPreferredTheme,
  activeTheme: calculateActiveTheme(initialPreferredTheme, initialSystemTheme),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setPreferredTheme: (state, action: PayloadAction<ThemePreference>) => {
      state.preferredTheme = action.payload;
      localStorage.setItem('theme', action.payload);
      // Recalculate active theme when preference changes
      const currentSystemTheme = getInitialSystemTheme(); // Re-check system theme
      state.activeTheme = calculateActiveTheme(action.payload, currentSystemTheme);
    },
    // Action to update active theme if system theme changes
    setSystemTheme: (state, action: PayloadAction<ActiveTheme>) => {
      // This action is primarily for when the system theme itself changes
      // and preferredTheme is 'system'.
      if (state.preferredTheme === 'system') {
        state.activeTheme = action.payload;
      }
    },
  },
});

export const { setPreferredTheme, setSystemTheme } = themeSlice.actions;
export default themeSlice.reducer; 