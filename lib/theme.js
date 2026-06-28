export const THEME_STORAGE_KEY = 'vmeste:themePreference';

export const THEME_OPTIONS = [
  { id: 'system', label: 'Системная', emoji: '📱' },
  { id: 'light', label: 'Светлая', emoji: '☀️' },
  { id: 'dark', label: 'Тёмная', emoji: '🌙' },
];

export const lightColors = {
  background: '#F1F5F9',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8FAFC',
  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  accent: '#EA580C',
  accentSoft: '#FFF7ED',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  tabActive: '#1E293B',
  tabInactive: '#94A3B8',
  statusBar: 'dark',
  pressed: '#F8FAFC',
  badge: '#EF4444',
};

export const darkColors = {
  background: '#000000',
  surface: '#1C1C1E',
  surfaceSecondary: '#262626',
  text: '#FFFFFF',
  textSecondary: '#A8A8A8',
  textMuted: '#737373',
  border: '#262626',
  accent: '#EA580C',
  accentSoft: '#3A2A1A',
  tabBar: '#000000',
  tabBarBorder: '#262626',
  tabActive: '#FFFFFF',
  tabInactive: '#737373',
  statusBar: 'light',
  pressed: '#1C1C1E',
  badge: '#FF3040',
};

export function resolveThemeMode(preference, systemScheme) {
  if (preference === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }
  return preference;
}

export function getThemeColors(mode) {
  return mode === 'dark' ? darkColors : lightColors;
}
