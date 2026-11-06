export const THEME_STORAGE_KEY = 'vmeste:themePreference';

export const THEME_OPTIONS = [
  { id: 'system', label: 'Системная', emoji: '📱' },
  { id: 'light', label: 'Светлая', emoji: '☀️' },
  { id: 'dark', label: 'Тёмная', emoji: '🌙' },
];

export const lightColors = {
  background: '#F5F7FB',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8FAFC',
  surfaceMuted: '#F5F7FB',
  text: '#14213D',
  textSecondary: '#5F6F86',
  textMuted: '#5F6F86',
  border: '#E2E8F0',
  accent: '#2563EB',
  onAccent: '#FFFFFF',
  accentSoft: '#EAF0FF',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  tabActive: '#2563EB',
  tabInactive: '#5F6F86',
  statusBar: 'dark',
  pressed: '#F8FAFC',
  badge: '#DC2626',
};

export const darkColors = {
  background: '#10141D',
  surface: '#1A2130',
  surfaceSecondary: '#283246',
  surfaceMuted: '#283246',
  text: '#FFFFFF',
  textSecondary: '#A8A8A8',
  textMuted: '#A0AEC0',
  border: '#283246',
  accent: '#2563EB',
  onAccent: '#FFFFFF',
  accentSoft: '#1E3156',
  tabBar: '#10141D',
  tabBarBorder: '#283246',
  tabActive: '#93B4FF',
  tabInactive: '#A0AEC0',
  statusBar: 'light',
  pressed: '#1A2130',
  badge: '#DC2626',
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
