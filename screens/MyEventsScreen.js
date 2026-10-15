import { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getEventById } from '../data/events';
import { useI18n } from '../lib/i18n';
import { useTheme } from '../lib/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function EventRow({ event, onPress }) {
  const styles = useStyles();
  const { t } = useI18n();
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(event.id)}
    >
      <View style={styles.dateBadge}>
        <Text style={styles.dateText}>{event.date}</Text>
      </View>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.city}>📍 {event.city}</Text>
      <Text style={styles.registered}>✓ {t('myEvents.registered')}</Text>
    </Pressable>
  );
}

export default function MyEventsScreen({
  registeredEventIds,
  events: allEvents,
  onBack,
  onOpenEvent,
  onCreateEvent,
}) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const events = registeredEventIds
    .map((id) => getEventById(id, allEvents))
    .filter(Boolean);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: 16 + insets.top }]}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}
          onPress={onBack}
        >
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backLabel}>{t('myEvents.backLabel')}</Text>
        </Pressable>
        <Text style={styles.screenTitle}>{t('myEvents.title')}</Text>
        <Text style={styles.screenSubtitle}>
          {t('myEvents.subtitle', { value: events.length })}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        <Pressable
          style={({ pressed }) => [styles.createButton, pressed && styles.cardPressed]}
          onPress={onCreateEvent}
        >
          <Text style={styles.createButtonText}>＋ {t('myEvents.createButton')}</Text>
        </Pressable>

        {events.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📅</Text>
            <Text style={styles.emptyTitle}>{t('myEvents.emptyTitle')}</Text>
            <Text style={styles.emptyText}>
              {t('myEvents.emptyText')}
            </Text>
          </View>
        ) : (
          events.map((event) => (
            <EventRow key={event.id} event={event} onPress={onOpenEvent} />
          ))
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
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      marginBottom: 16,
      paddingVertical: 6,
      paddingRight: 12,
    },
    backPressed: { opacity: 0.6 },
    backIcon: { fontSize: 20, color: colors.accent, marginRight: 4 },
    backLabel: { fontSize: 16, fontWeight: '500', color: colors.accent },
    screenTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.5,
      marginBottom: 6,
    },
    screenSubtitle: { fontSize: 15, color: colors.textSecondary },
    list: { paddingHorizontal: 24, paddingBottom: 16, gap: 12 },
    createButton: {
      backgroundColor: '#7C3AED',
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
    },
    createButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#FFFFFF',
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
    cardPressed: { opacity: 0.92 },
    dateBadge: {
      alignSelf: 'flex-start',
      backgroundColor: '#F3E8FF',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      marginBottom: 10,
    },
    dateText: { fontSize: 13, fontWeight: '600', color: '#7C3AED' },
    title: { fontSize: 17, fontWeight: '600', color: colors.text, marginBottom: 6 },
    city: { fontSize: 14, color: colors.textSecondary, marginBottom: 8 },
    registered: { fontSize: 13, fontWeight: '600', color: '#059669' },
    empty: { alignItems: 'center', paddingTop: 60 },
    emptyEmoji: { fontSize: 48, marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: 8 },
    emptyText: {
      fontSize: 15,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 22,
      paddingHorizontal: 32,
    },
  });
}
