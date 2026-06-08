import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getMemberById } from '../data/members';

function ConnectionRow({ member, onPress, onMessage }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={() => onPress(member.id)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{member.name.charAt(0)}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{member.name}</Text>
        <Text style={styles.role}>{member.role}</Text>
        <Text style={styles.city}>📍 {member.city}</Text>
      </View>
      <Pressable
        style={({ pressed }) => [styles.msgButton, pressed && styles.msgPressed]}
        onPress={() => onMessage(member.id)}
      >
        <Text style={styles.msgIcon}>💬</Text>
      </Pressable>
    </Pressable>
  );
}

export default function ConnectionsScreen({
  connectedIds,
  onBack,
  onOpenMember,
  onMessage,
}) {
  const connections = connectedIds.map(getMemberById).filter(Boolean);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}
          onPress={onBack}
        >
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backLabel}>Профиль</Text>
        </Pressable>
        <Text style={styles.screenTitle}>Мои связи</Text>
        <Text style={styles.screenSubtitle}>{connections.length} человек</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {connections.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🤝</Text>
            <Text style={styles.emptyTitle}>Пока нет связей</Text>
            <Text style={styles.emptyText}>
              Добавляйте людей через раздел «Нетворкинг»
            </Text>
          </View>
        ) : (
          <View style={styles.card}>
            {connections.map((member, index) => (
              <View key={member.id}>
                <ConnectionRow
                  member={member}
                  onPress={onOpenMember}
                  onMessage={onMessage}
                />
                {index < connections.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
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
  list: { paddingHorizontal: 24, paddingBottom: 16, flexGrow: 1 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  rowPressed: { backgroundColor: '#F8FAFC' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: { fontSize: 18, fontWeight: '600', color: '#7C3AED' },
  content: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  role: { fontSize: 14, color: '#64748B', marginTop: 2 },
  city: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  msgButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgPressed: { opacity: 0.7 },
  msgIcon: { fontSize: 18 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 16 },
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
