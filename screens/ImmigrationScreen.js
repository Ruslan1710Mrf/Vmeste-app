import { useMemo, useState } from 'react';
import {
  Image,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { IMMIGRATION_SECTIONS } from '../data/immigration';
import { localize, useI18n } from '../lib/i18n';

const IMMIGRATION_APPS = [
  {
    id: 'uscis',
    name: 'USCIS',
    url: 'https://www.uscis.gov/',
    icon: 'https://www.google.com/s2/favicons?domain=uscis.gov&sz=128',
    bg: '#003366',
    fallback: 'US',
  },
  {
    id: 'boundless',
    name: 'Boundless',
    url: 'https://www.boundless.com/',
    icon: 'https://www.google.com/s2/favicons?domain=boundless.com&sz=128',
    bg: '#00A896',
    fallback: 'B',
  },
  {
    id: 'citizenpath',
    name: 'CitizenPath',
    url: 'https://citizenpath.com/',
    icon: 'https://www.google.com/s2/favicons?domain=citizenpath.com&sz=128',
    bg: '#2E7D32',
    fallback: 'CP',
  },
  {
    id: 'nolo',
    name: 'Nolo',
    url: 'https://www.nolo.com/',
    icon: 'https://www.google.com/s2/favicons?domain=nolo.com&sz=128',
    bg: '#E65100',
    fallback: 'N',
  },
];

function ImmigrationAppIcon({ app }) {
  const [iconFailed, setIconFailed] = useState(false);

  return (
    <Pressable
      style={({ pressed }) => [styles.appItem, pressed && styles.appItemPressed]}
      onPress={() => Linking.openURL(app.url)}
    >
      <View style={[styles.appIcon, { backgroundColor: app.bg }]}>
        {!iconFailed ? (
          <Image
            source={{ uri: app.icon }}
            style={styles.appIconImage}
            resizeMode="cover"
            onError={() => setIconFailed(true)}
          />
        ) : (
          <Text style={styles.appIconFallback}>{app.fallback}</Text>
        )}
      </View>
      <Text style={styles.appName} numberOfLines={2}>
        {app.name}
      </Text>
    </Pressable>
  );
}

function ResourceItem({ item, isLink, accentColor, onSelectGuide }) {
  const { t, language } = useI18n();
  const content = (
    <>
      <Text style={styles.itemTitle}>{localize(item.title, language)}</Text>
      <Text style={styles.itemDescription}>{localize(item.description, language)}</Text>
      {isLink ? (
        <Text style={[styles.linkHint, { color: accentColor }]}>{t('immigration.openLink')}</Text>
      ) : (
        <Text style={[styles.linkHint, { color: accentColor }]}>{t('immigration.readMore')}</Text>
      )}
    </>
  );

  if (isLink && item.url) {
    return (
      <Pressable
        style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
        onPress={() => Linking.openURL(item.url)}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
      onPress={() => onSelectGuide(item)}
    >
      {content}
    </Pressable>
  );
}

function Section({ section, onSelectGuide }) {
  const { language } = useI18n();
  const isLinks = section.id === 'links';

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: `${section.color}18` }]}>
          <Text style={styles.sectionEmoji}>{section.emoji}</Text>
        </View>
        <Text style={styles.sectionTitle}>{localize(section.title, language)}</Text>
      </View>
      <View style={[styles.sectionCard, { borderLeftColor: section.color }]}>
        {section.items.map((item, index) => (
          <View key={item.id}>
            <ResourceItem
              item={item}
              isLink={isLinks}
              accentColor={section.color}
              onSelectGuide={(guideItem) => onSelectGuide(section, guideItem)}
            />
            {index < section.items.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </View>
    </View>
  );
}

export default function ImmigrationScreen({ onSelectGuide, onRefresh = () => {} }) {
  const { t, language } = useI18n();
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return IMMIGRATION_SECTIONS;
    return IMMIGRATION_SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          localize(item.title, language).toLowerCase().includes(q) ||
          localize(item.description, language).toLowerCase().includes(q),
      ),
    })).filter((section) => section.items.length > 0);
  }, [query, language]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>{t('immigration.title')}</Text>
        <Text style={styles.screenSubtitle}>
          {t('immigration.subtitle')}
        </Text>
        <TextInput
          style={styles.searchInput}
          placeholder={t('immigration.searchPlaceholder')}
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={setQuery}
        />
        <View style={styles.appsRow}>
          {IMMIGRATION_APPS.map((app) => (
            <ImmigrationAppIcon key={app.id} app={app} />
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {filteredSections.length === 0 ? (
          <Text style={styles.empty}>{t('immigration.noResults')}</Text>
        ) : (
          filteredSections.map((section) => (
            <Section key={section.id} section={section} onSelectGuide={onSelectGuide} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20 },
  screenTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#22C55E',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  screenSubtitle: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1E293B',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: 12,
  },
  appsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  appItem: {
    alignItems: 'center',
    width: 72,
  },
  appItemPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  appIcon: {
    width: 60,
    height: 60,
    borderRadius: 13,
    marginBottom: 6,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  appIconImage: {
    width: 60,
    height: 60,
  },
  appIconFallback: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  appName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 14,
  },
  empty: { textAlign: 'center', fontSize: 15, color: '#94A3B8', marginTop: 32 },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 24, paddingBottom: 16, gap: 24 },
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionEmoji: { fontSize: 18 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#22C55E' },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderLeftWidth: 4,
    paddingVertical: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  item: { paddingHorizontal: 20, paddingVertical: 14 },
  itemPressed: { backgroundColor: '#F8FAFC' },
  itemTitle: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  itemDescription: { fontSize: 14, lineHeight: 20, color: '#64748B' },
  linkHint: { marginTop: 8, fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 20 },
});
