import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from './Icon';
import { useTheme } from '../lib/ThemeContext';
import { useI18n } from '../lib/i18n';
const TABS = [
  { id: 'home', icon: 'home' }, { id: 'jobs', icon: 'briefcase' },
  { id: 'overview', icon: 'grid' }, { id: 'ai', icon: 'sparkles' }, { id: 'profile', icon: 'user' },
];
export default function TabBar({ active, onChange }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useI18n();
  const selected = ['resources', 'immigration', 'networking'].includes(active) ? 'overview' : active;
  return <View style={[styles.container, { backgroundColor: colors.tabBar, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 8) }]}>
    {TABS.map(tab => {
      const isActive = selected === tab.id;
      const color = isActive ? colors.tabActive : colors.tabInactive;
      return <Pressable key={tab.id} accessibilityRole="tab" accessibilityState={{ selected: isActive }} accessibilityLabel={t(`tabBar.${tab.id}`)} onPress={() => onChange(tab.id)} style={({ pressed }) => [styles.tab, pressed && { opacity: .65 }]}>
        <View style={[styles.icon, isActive && { backgroundColor: colors.accentSoft }]}><Icon name={tab.icon} color={color} /></View>
        <Text numberOfLines={1} style={[styles.label, { color }]}>{t(`tabBar.${tab.id}`)}</Text>
      </Pressable>;
    })}
  </View>;
}
const styles = StyleSheet.create({
  container: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 6, paddingHorizontal: 8 },
  tab: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', gap: 3 },
  icon: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 12 },
  label: { fontSize: 11, fontWeight: '600' },
});
