import { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getJobById } from '../data/jobs';
import { localize, useI18n } from '../lib/i18n';
import { useTheme } from '../lib/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function SavedJobCard({ job, onPress, onRemove }) {
  const styles = useStyles();
  const { language } = useI18n();
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(job.id)}
    >
      <View style={styles.cardTop}>
        <View style={styles.cardInfo}>
          <Text style={styles.title}>{localize(job.title, language)}</Text>
          <Text style={styles.company}>{job.company}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.removeButton, pressed && styles.removePressed]}
          onPress={(e) => {
            e.stopPropagation?.();
            onRemove(job.id);
          }}
          hitSlop={8}
        >
          <Text style={styles.removeIcon}>🔖</Text>
        </Pressable>
      </View>
      <View style={styles.meta}>
        <Text style={styles.city}>📍 {localize(job.city, language)}</Text>
        <Text style={styles.salary}>{job.salary}</Text>
      </View>
    </Pressable>
  );
}

function SavedPostCard({ post, onPress, onRemove }) {
  const styles = useStyles();
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(post.id)}
    >
      <View style={styles.cardTop}>
        <View style={styles.cardInfo}>
          <Text style={styles.title}>{post.author}</Text>
          <Text style={styles.company} numberOfLines={2}>{post.content}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.removeButton, pressed && styles.removePressed]}
          onPress={(e) => {
            e.stopPropagation?.();
            onRemove(post.id);
          }}
          hitSlop={8}
        >
          <Text style={styles.removeIcon}>🔖</Text>
        </Pressable>
      </View>
      {!!post.city && <View style={styles.meta}><Text style={styles.city}>📍 {post.city}</Text></View>}
    </Pressable>
  );
}

export default function SavedJobsScreen({
  savedJobIds,
  savedPosts = [],
  onBack,
  onSelectJob,
  onToggleSave,
  onSelectPost,
  onUnsavePost,
}) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const jobs = savedJobIds.map(getJobById).filter(Boolean);
  const total = jobs.length + savedPosts.length;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: 16 + insets.top }]}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}
          onPress={onBack}
        >
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backLabel}>{t('savedJobs.backLabel')}</Text>
        </Pressable>
        <Text style={styles.screenTitle}>{t('savedJobs.title')}</Text>
        <Text style={styles.screenSubtitle}>
          {t('savedJobs.subtitle', { value: total })}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {total === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔖</Text>
            <Text style={styles.emptyTitle}>{t('savedJobs.emptyTitle')}</Text>
            <Text style={styles.emptyText}>{t('savedJobs.emptyText')}</Text>
          </View>
        ) : (
          <>
            {savedPosts.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>{t('savedJobs.postsSection')}</Text>
                {savedPosts.map((post) => (
                  <SavedPostCard
                    key={post.id}
                    post={post}
                    onPress={onSelectPost}
                    onRemove={onUnsavePost}
                  />
                ))}
              </>
            )}
            {jobs.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>{t('savedJobs.jobsSection')}</Text>
                {jobs.map((job) => (
                  <SavedJobCard
                    key={job.id}
                    job={job}
                    onPress={onSelectJob}
                    onRemove={onToggleSave}
                  />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function useStyles() {
  const { colors } = useTheme();
  return useMemo(() => createStyles(colors), [colors]);
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      flex: 1,
    },
    sectionLabel: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8, marginBottom: 10, marginHorizontal: 4 },
    header: {
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 16,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      marginBottom: 16,
      paddingVertical: 6,
      paddingRight: 12,
    },
    backPressed: {
      opacity: 0.6,
    },
    backIcon: {
      fontSize: 20,
      color: colors.accent,
      marginRight: 4,
    },
    backLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.accent,
    },
    screenTitle: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.5,
      marginBottom: 6,
    },
    screenSubtitle: {
      fontSize: 15,
      color: colors.textSecondary,
    },
    listContent: {
      paddingHorizontal: 24,
      paddingBottom: 16,
      gap: 12,
      flexGrow: 1,
    },
    empty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 60,
    },
    emptyEmoji: {
      fontSize: 48,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 15,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 22,
      paddingHorizontal: 32,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 18,
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    cardPressed: {
      opacity: 0.92,
    },
    cardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    cardInfo: {
      flex: 1,
      marginRight: 12,
    },
    title: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    company: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    removeButton: {
      padding: 4,
    },
    removePressed: {
      opacity: 0.6,
    },
    removeIcon: {
      fontSize: 20,
    },
    meta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    city: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    salary: {
      fontSize: 13,
      fontWeight: '600',
      color: '#059669',
    },
  });
}
