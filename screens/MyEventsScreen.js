import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getEventById } from '../data/events';
import { useI18n } from '../lib/i18n';

function EventRow({ event, onPress }) {
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
  const { t } = useI18n();
  const events = registeredEventIds
    .map((id) => getEventById(id, allEvents))
    .filter(Boolean);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
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

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  backIcon: { fontSize: 20, color: '#EA580C', marginRight: 4 },
  backLabel: { fontSize: 16, fontWeight: '500', color: '#EA580C' },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  screenSubtitle: { fontSize: 15, color: '#64748B' },
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
    backgroundColor: '#FFFFFF',
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
  title: { fontSize: 17, fontWeight: '600', color: '#1E293B', marginBottom: 6 },
  city: { fontSize: 14, color: '#64748B', marginBottom: 8 },
  registered: { fontSize: 13, fontWeight: '600', color: '#059669' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#1E293B', marginBottom: 8 },
  emptyText: {
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 32,
  },
});
