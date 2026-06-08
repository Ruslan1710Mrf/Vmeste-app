import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function EventDetailScreen({ event, onBack, isRegistered, onRegister }) {
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
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dateBadge}>
          <Text style={styles.dateText}>{event.date}</Text>
        </View>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.host}>Организатор: {event.host}</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📍 Город</Text>
            <Text style={styles.infoValue}>{event.city}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🏢 Место</Text>
            <Text style={[styles.infoValue, styles.venue]}>{event.venue}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>👥 Участники</Text>
            <Text style={styles.infoValue}>{event.attendees} человек</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>О событии</Text>
        <Text style={styles.body}>{event.description}</Text>

        <Text style={styles.sectionTitle}>Программа</Text>
        <View style={styles.agenda}>
          {event.agenda.map((item) => (
            <View key={item} style={styles.agendaRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.agendaText}>{item}</Text>
            </View>
          ))}
        </View>

        {isRegistered ? (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>✓ Вы зарегистрированы!</Text>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.registerButton, pressed && styles.buttonPressed]}
            onPress={() => onRegister(event.id)}
          >
            <Text style={styles.registerText}>Зарегистрироваться</Text>
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
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingRight: 12,
  },
  backPressed: {
    opacity: 0.6,
  },
  backIcon: {
    fontSize: 20,
    color: '#7C3AED',
    marginRight: 4,
  },
  backLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#7C3AED',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  dateBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 14,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  host: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 20,
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
    alignItems: 'flex-start',
    gap: 12,
  },
  infoLabel: {
    fontSize: 15,
    color: '#64748B',
  },
  infoValue: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'right',
  },
  venue: {
    fontWeight: '500',
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
  agenda: {
    gap: 10,
    marginBottom: 32,
  },
  agendaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 15,
    color: '#7C3AED',
    marginRight: 8,
    lineHeight: 22,
  },
  agendaText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
  },
  registerButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  registerText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  successBanner: {
    backgroundColor: '#F3E8FF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
  },
});
