import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import {
  THEME_STORAGE_KEY,
  getThemeColors,
  resolveThemeMode,
} from './theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState('system');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((stored) => {
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setPreferenceState(stored);
        }
      })
      .finally(() => setReady(true));
  }, []);

  const setThemePreference = async (mode) => {
    setPreferenceState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // storage unavailable during dev
    }
  };

  const resolvedMode = resolveThemeMode(preference, systemScheme);
  const colors = getThemeColors(resolvedMode);

  const value = useMemo(
    () => ({
      preference,
      resolvedMode,
      colors,
      isDark: resolvedMode === 'dark',
      setThemePreference,
      ready,
    }),
    [preference, resolvedMode, colors, ready],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
