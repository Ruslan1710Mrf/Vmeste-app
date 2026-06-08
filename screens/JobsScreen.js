import { useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { JOBS } from '../data/jobs';

const TYPE_FILTERS = [
  { id: 'all', label: 'Все типы', test: () => true },
  { id: 'full', label: 'Полная занятость', test: (type) => type === 'Полная занятость' },
  { id: 'flex', label: 'Гибкий график', test: (type) => type === 'Гибкий график' },
];

const CITY_FILTERS = [
  { id: 'all', label: 'Все', test: () => true },
  {
    id: 'ny',
    label: 'Нью-Йорк',
    test: (city) => /NY|Нью-Йорк|Brighton/i.test(city),
  },
  {
    id: 'ca',
    label: 'Калифорния',
    test: (city) => /CA|Менло|Лос-Анджелес/i.test(city),
  },
  {
    id: 'tx',
    label: 'Техас',
    test: (city) => /TX|Остин/i.test(city),
  },
  {
    id: 'other',
    label: 'Другие',
    test: (city) =>
      !/NY|Нью-Йорк|Brighton|CA|Менло|Лос-Анджелес|TX|Остин/i.test(city),
  },
];

function JobCard({ job, onPress, isSaved, onToggleSave }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(job.id)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardBody}>
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.company}>{job.company}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.saveButton, pressed && styles.savePressed]}
          onPress={() => onToggleSave(job.id)}
          hitSlop={8}
        >
          <Text style={styles.saveIcon}>{isSaved ? '🔖' : '🏷️'}</Text>
        </Pressable>
      </View>
      <View style={styles.meta}>
        <View style={styles.cityRow}>
          <Text style={styles.cityIcon}>📍</Text>
          <Text style={styles.city}>{job.city}</Text>
        </View>
        <View style={styles.salaryBadge}>
          <Text style={styles.salary}>{job.salary}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function JobsScreen({ onSelectJob, savedJobIds, onToggleSave, onRefresh }) {
  const [query, setQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cityFn = CITY_FILTERS.find((f) => f.id === cityFilter)?.test ?? (() => true);
    const typeFn = TYPE_FILTERS.find((f) => f.id === typeFilter)?.test ?? (() => true);
    return JOBS.filter((job) => {
      if (!cityFn(job.city) || !typeFn(job.type)) return false;
      if (!q) return true;
      return (
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.city.toLowerCase().includes(q)
      );
    });
  }, [query, cityFilter, typeFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh?.();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Работа</Text>
        <Text style={styles.screenSubtitle}>
          {filtered.length} вакансий для нашего сообщества
        </Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск по должности, компании, городу..."
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={setQuery}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filters}
        >
          {CITY_FILTERS.map((filter) => (
            <Pressable
              key={filter.id}
              style={[
                styles.filterChip,
                cityFilter === filter.id && styles.filterChipActive,
              ]}
              onPress={() => setCityFilter(filter.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  cityFilter === filter.id && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filters}
        >
          {TYPE_FILTERS.map((filter) => (
            <Pressable
              key={filter.id}
              style={[
                styles.filterChip,
                typeFilter === filter.id && styles.filterChipActive,
              ]}
              onPress={() => setTypeFilter(filter.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  typeFilter === filter.id && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {filtered.length === 0 ? (
          <Text style={styles.empty}>Ничего не найдено</Text>
        ) : (
          filtered.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onPress={onSelectJob}
              isSaved={savedJobIds.includes(job.id)}
              onToggleSave={onToggleSave}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
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
  filtersScroll: {
    marginHorizontal: -24,
  },
  filters: {
    paddingHorizontal: 24,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 12,
  },
  empty: {
    textAlign: 'center',
    fontSize: 15,
    color: '#94A3B8',
    marginTop: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardBody: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    padding: 4,
  },
  savePressed: {
    opacity: 0.6,
  },
  saveIcon: {
    fontSize: 22,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  company: {
    fontSize: 15,
    color: '#64748B',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  city: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  salaryBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  salary: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },
});
