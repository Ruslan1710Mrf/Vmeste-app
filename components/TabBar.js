import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AiTabIcon from './icons/AiTabIcon';
import { useTheme } from '../lib/ThemeContext';
import { useI18n } from '../lib/i18n';

const TAB_ACTIVE_COLOR = '#22C55E';

const TABS = [
  { id: 'home', labelKey: 'tabBar.home', emoji: '🏠' },
  { id: 'jobs', labelKey: 'tabBar.jobs', emoji: '💼' },
  { id: 'resources', labelKey: 'tabBar.resources', emoji: '📚' },
  { id: 'immigration', labelKey: 'tabBar.immigration', emoji: '🌍' },
  { id: 'ai', labelKey: 'tabBar.ai', icon: 'ai' },
  { id: 'networking', labelKey: 'tabBar.networking', emoji: '🤝' },
  { id: 'profile', labelKey: 'tabBar.profile', emoji: '👤' },
];

export default function TabBar({ active, onChange }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useI18n();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          paddingBottom: 12 + (insets.bottom ?? 0),
        },
      ]}
    >
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <Pressable
            key={tab.id}
            style={({ pressed }) => [
              styles.tab,
              pressed && styles.tabPressed,
            ]}
            onPress={() => onChange(tab.id)}
          >
            {tab.icon === 'ai' ? (
              <View style={styles.iconWrap}>
                <AiTabIcon active={isActive} inactiveColor={colors.tabInactive} />
              </View>
            ) : (
              <Text style={styles.emoji}>{tab.emoji}</Text>
            )}
            <Text
              style={[
                styles.label,
                { color: colors.tabInactive },
                isActive && { color: TAB_ACTIVE_COLOR, fontWeight: '600' },
              ]}
            >
              {t(tab.labelKey)}
            </Text>
            {isActive ? (
              <View style={[styles.activeDot, { backgroundColor: TAB_ACTIVE_COLOR }]} />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    position: 'relative',
  },
  tabPressed: {
    opacity: 0.7,
  },
  iconWrap: {
    height: 22,
    marginBottom: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
  },
  activeDot: {
    position: 'absolute',
    top: 0,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
