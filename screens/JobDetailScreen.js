import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function JobDetailScreen({ job, onBack, isSaved, onToggleSave }) {
  const [applied, setApplied] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${job.title}\n${job.company}\n📍 ${job.city}\n💰 ${job.salary}\n\n— Vmeste`,
      });
    } catch {
      // user cancelled
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}
          onPress={onBack}
        >
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backLabel}>Назад</Text>
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
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.company}>{job.company}</Text>
          <View style={styles.badges}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{job.type}</Text>
            </View>
            <Text style={styles.posted}>{job.posted}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📍 Город</Text>
            <Text style={styles.infoValue}>{job.city}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>💰 Зарплата</Text>
            <Text style={[styles.infoValue, styles.salary]}>{job.salary}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Описание</Text>
        <Text style={styles.body}>{job.description}</Text>

        <Text style={styles.sectionTitle}>Требования</Text>
        <View style={styles.requirements}>
          {job.requirements.map((req) => (
            <View key={req} style={styles.requirementRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.requirementText}>{req}</Text>
            </View>
          ))}
        </View>

        {applied ? (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>✓ Отклик отправлен!</Text>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.applyButton, pressed && styles.applyPressed]}
            onPress={() => setApplied(true)}
          >
            <Text style={styles.applyText}>Откликнуться</Text>
          </Pressable>
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
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  company: {
    fontSize: 17,
    color: '#64748B',
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
    color: '#94A3B8',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
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
    color: '#64748B',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  salary: {
    color: '#059669',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 10,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    color: '#475569',
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
    color: '#475569',
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
  successBanner: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
});
