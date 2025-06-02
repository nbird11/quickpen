import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { setSystemTheme, setPreferredTheme } from '../store/slices/themeSlice';

type ThemePreference = 'light' | 'dark' | 'system';

export const useThemeManager = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { activeTheme, preferredTheme } = useSelector((state: RootState) => state.theme);

  // Apply the active theme to the document
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', activeTheme);
  }, [activeTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      dispatch(setSystemTheme(newSystemTheme));
    };

    mediaQuery.addEventListener('change', handleChange);

    // Initial check in case the theme changed while the event listener wasn't active
    // or if preferredTheme was set to 'system' from another tab for example
    if (preferredTheme === 'system') {
        const currentSystemTheme = mediaQuery.matches ? 'dark' : 'light';
        if (activeTheme !== currentSystemTheme) { // only dispatch if different from current activeTheme
            dispatch(setSystemTheme(currentSystemTheme));
        }
    }

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [dispatch, preferredTheme, activeTheme]); // Added activeTheme to dependencies

  const handleSetPreferredTheme = (theme: ThemePreference) => {
    dispatch(setPreferredTheme(theme));
  };

  return { activeTheme, preferredTheme, setThemePreference: handleSetPreferredTheme };
}; 