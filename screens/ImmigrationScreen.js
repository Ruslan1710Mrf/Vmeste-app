import { useMemo, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { IMMIGRATION_SECTIONS } from '../data/immigration';

function ResourceItem({ item, isLink, accentColor, onSelectGuide }) {
  const content = (
    <>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemDescription}>{item.description}</Text>
      {isLink ? (
        <Text style={[styles.linkHint, { color: accentColor }]}>Открыть →</Text>
      ) : (
        <Text style={[styles.linkHint, { color: accentColor }]}>Подробнее →</Text>
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
  const isLinks = section.id === 'links';

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: `${section.color}18` }]}>
          <Text style={styles.sectionEmoji}>{section.emoji}</Text>
        </View>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
      <View style={[styles.sectionCard, { borderLeftColor: section.color }]}>
        {section.items.map((item, index) => (
          <View key={item.title}>
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

export default function ImmigrationScreen({ onSelectGuide }) {
  const [query, setQuery] = useState('');

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return IMMIGRATION_SECTIONS;
    return IMMIGRATION_SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q),
      ),
    })).filter((section) => section.items.length > 0);
  }, [query]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Иммиграция</Text>
        <Text style={styles.screenSubtitle}>
          Гид по иммиграции в США для соотечественников из СНГ
        </Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск по визам, грин карте, гражданству..."
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredSections.length === 0 ? (
          <Text style={styles.empty}>Ничего не найдено</Text>
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
    color: '#0F172A',
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
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#1E293B' },
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
