import { ScrollView, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../lib/ThemeContext';
import { useI18n } from '../lib/i18n';
import Icon from '../components/Icon';
const ITEMS = [{ id: 'resources', icon: 'book' }, { id: 'immigration', icon: 'globe' }, { id: 'networking', icon: 'users' }];
export default function OverviewScreen({ onNavigate }) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  return <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, width: '100%', maxWidth: 760, alignSelf: 'center' }}>
    <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text }}>{t('tabBar.overview')}</Text>
    <Text style={{ color: colors.textSecondary, fontSize: 16, marginTop: 8, marginBottom: 24 }}>{t('overview.subtitle')}</Text>
    {ITEMS.map(item => <Pressable key={item.id} accessibilityRole="button" onPress={() => onNavigate(item.id)} style={({ pressed }) => ({ padding: 20, borderRadius: 20, marginBottom: 12, backgroundColor: pressed ? colors.pressed : colors.surface, flexDirection: 'row', alignItems: 'center', gap: 16 })}>
      <View style={{ padding: 12, borderRadius: 14, backgroundColor: colors.accentSoft }}><Icon name={item.icon} color={colors.tabActive} /></View>
      <View style={{ flex: 1 }}><Text style={{ color: colors.text, fontSize: 18, fontWeight: '600' }}>{t(`backLabel.${item.id}`)}</Text><Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 6 }}>{t(`overview.${item.id}`)}</Text></View>
      <Icon name="chevron" size={18} />
    </Pressable>)}
  </ScrollView>;
}
