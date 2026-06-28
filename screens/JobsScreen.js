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
import { JOBS } from '../data/jobs';
import { useI18n } from '../lib/i18n';

const JOB_APPS = [
  {
    id: 'flagma',
    name: 'Flagma.Job',
    url: 'https://flagma.com/vacancies/',
    icon: 'https://www.google.com/s2/favicons?domain=flagma.com&sz=128',
    bg: '#FF6B2C',
    fallback: 'FJ',
  },
  {
    id: 'indeed',
    name: 'Indeed Jobs',
    url: 'https://www.indeed.com/',
    icon: 'https://www.google.com/s2/favicons?domain=indeed.com&sz=128',
    bg: '#2557A7',
    fallback: 'in',
  },
  {
    id: 'bazar',
    name: 'Bazar',
    url: 'https://www.bazar.club/',
    icon: 'https://www.google.com/s2/favicons?domain=bazar.club&sz=128',
    bg: '#7C3AED',
    fallback: 'B',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/jobs/',
    icon: 'https://www.google.com/s2/favicons?domain=linkedin.com&sz=128',
    bg: '#0A66C2',
    fallback: 'in',
  },
];

function JobAppIcon({ app }) {
  const [iconFailed, setIconFailed] = useState(false);

  return (
    <Pressable
      style={({ pressed }) => [styles.appItem, pressed && styles.appItemPressed]}
      onPress={() => Linking.openURL(app.url)}
    >
      <View style={styles.appIcon}>
        {!iconFailed ? (
          <Image
            source={{ uri: app.icon }}
            style={styles.appIconImage}
            resizeMode="cover"
            onError={() => setIconFailed(true)}
          />
        ) : (
          <Text style={[styles.appIconFallback, { color: app.bg }]}>{app.fallback}</Text>
        )}
      </View>
      <Text style={styles.appName} numberOfLines={2}>
        {app.name}
      </Text>
    </Pressable>
  );
}

function JobCard({ job, onPress, isSaved, onToggleSave }) {
  const handleOpen = () => {
    if (job.applyUrl) {
      Linking.openURL(job.applyUrl).catch(() => {});
      return;
    }
    onPress(job.id);
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={handleOpen}
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

export default function JobsScreen({ onSelectJob, savedJobIds, onToggleSave, onRefresh = () => {} }) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return JOBS;
    return JOBS.filter(
      (job) =>
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.city.toLowerCase().includes(q),
    );
  }, [query, dataVersion]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
      setDataVersion((v) => v + 1);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>{t('jobs.title')}</Text>
        <Text style={styles.screenSubtitle}>
          {t('jobs.subtitle', { value: filtered.length })}
        </Text>
        <TextInput
          style={styles.searchInput}
          placeholder={t('jobs.searchPlaceholder')}
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={setQuery}
        />
        <View style={styles.appsRow}>
          {JOB_APPS.map((app) => (
            <JobAppIcon key={app.id} app={app} />
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
        {filtered.length === 0 ? (
          <Text style={styles.empty}>{t('jobs.empty')}</Text>
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
    color: '#EAB308',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
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
  },
  appName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 14,
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
