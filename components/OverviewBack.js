import { Pressable, Text } from 'react-native';
import { useTheme } from '../lib/ThemeContext';
import { useI18n } from '../lib/i18n';
import Icon from './Icon';
export default function OverviewBack({ onPress }) {
  const { colors } = useTheme(); const { t } = useI18n();
  if (!onPress) return null;
  return <Pressable accessibilityRole="button" onPress={onPress} style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}><Icon name="back" size={18} color={colors.tabActive} /><Text style={{ color: colors.tabActive, fontSize: 15 }}>{t('tabBar.overview')}</Text></Pressable>;
}
