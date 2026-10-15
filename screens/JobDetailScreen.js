import { useMemo } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { localize, useI18n } from '../lib/i18n';
import { useTheme } from '../lib/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function getJobShareMessage(job, language) {
  const lines = [localize(job.title, language), job.company, `💰 ${job.salary}`];
  if (job.applyUrl) {
    lines.push(job.applyUrl);
  }
  return lines.join('\n');
}

export default function JobDetailScreen({ job, onBack, isSaved, onToggleSave }) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { t, language } = useI18n();
  const handleShare = async () => {
    try {
      await Share.share({ message: getJobShareMessage(job, language) });
    } catch {
      // user cancelled
    }
  };

  const handleApply = async () => {
    if (!job.applyUrl) {
      Alert.alert(t('jobDetail.linkUnavailableTitle'), t('jobDetail.linkUnavailableMessage'));
      return;
    }

    try {
      const supported = await Linking.canOpenURL(job.applyUrl);
      if (!supported) {
        Alert.alert(t('jobDetail.linkOpenFailedTitle'), job.applyUrl);
        return;
      }
      await Linking.openURL(job.applyUrl);
    } catch {
      Alert.alert(t('jobDetail.linkOpenFailedTitle'), t('jobDetail.tryAgainLater'));
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: 8 + insets.top }]}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}
          onPress={onBack}
        >
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backLabel}>{t('jobDetail.back')}</Text>
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable
            style={({ pressed }) => [styles.iconButton, pressed && styles.backPressed]}
            onPress={handleShare}
          >
            <Text style={styles.actionIcon}>↗</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.iconButton, pressed && styles.backPressed]}
            onPress={() => onToggleSave(job.id)}
          >
            <Text style={styles.saveIcon}>{isSaved ? '🔖' : '🏷️'}</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{localize(job.title, language)}</Text>
          <Text style={styles.company}>{job.company}</Text>
          <View style={styles.badges}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{localize(job.type, language)}</Text>
            </View>
            <Text style={styles.posted}>{localize(job.posted, language)}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📍 {t('jobDetail.city')}</Text>
            <Text style={styles.infoValue}>{localize(job.city, language)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>💰 {t('jobDetail.salary')}</Text>
            <Text style={[styles.infoValue, styles.salary]}>{job.salary}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t('jobDetail.description')}</Text>
        <Text style={styles.body}>{localize(job.description, language)}</Text>

        <Text style={styles.sectionTitle}>{t('jobDetail.requirements')}</Text>
        <View style={styles.requirements}>
          {localize(job.requirements, language).map((req) => (
            <View key={req} style={styles.requirementRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.requirementText}>{req}</Text>
            </View>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [styles.applyButton, pressed && styles.applyPressed]}
          onPress={handleApply}
        >
          <Text style={styles.applyText}>{t('jobDetail.apply')}</Text>
        </Pressable>
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingTop: 8,
      paddingBottom: 8,
    },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    iconButton: { padding: 8 },
    actionIcon: { fontSize: 22, color: '#2563EB', fontWeight: '600' },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingRight: 12,
    },
    backPressed: {
      opacity: 0.6,
    },
    backIcon: {
      fontSize: 20,
      color: '#2563EB',
      marginRight: 4,
    },
    backLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: '#2563EB',
    },
    saveButton: {
      padding: 8,
    },
    saveIcon: {
      fontSize: 24,
    },
    content: {
      paddingHorizontal: 24,
      paddingBottom: 32,
    },
    titleBlock: {
      marginBottom: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.5,
      marginBottom: 6,
    },
    company: {
      fontSize: 17,
      color: colors.textSecondary,
      marginBottom: 12,
    },
    badges: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    typeBadge: {
      backgroundColor: '#EFF6FF',
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 8,
    },
    typeText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#2563EB',
    },
    posted: {
      fontSize: 13,
      color: colors.textMuted,
    },
    infoCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 18,
      marginBottom: 24,
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    infoLabel: {
      fontSize: 15,
      color: colors.textSecondary,
    },
    infoValue: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    salary: {
      color: '#059669',
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 14,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 10,
    },
    body: {
      fontSize: 15,
      lineHeight: 24,
      color: colors.textSecondary,
      marginBottom: 24,
    },
    requirements: {
      gap: 10,
      marginBottom: 32,
    },
    requirementRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    bullet: {
      fontSize: 15,
      color: '#2563EB',
      marginRight: 8,
      lineHeight: 22,
    },
    requirementText: {
      flex: 1,
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSecondary,
    },
    applyButton: {
      backgroundColor: '#2563EB',
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
    },
    applyPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.99 }],
    },
    applyText: {
      fontSize: 17,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });
}
