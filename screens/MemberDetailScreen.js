import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function MemberDetailScreen({
  member,
  onBack,
  isConnected,
  onConnect,
  onMessage,
}) {

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

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{member.name.charAt(0)}</Text>
          </View>
          <Text style={styles.name}>{member.name}</Text>
          <Text style={styles.role}>{member.role}</Text>
          <Text style={styles.city}>{member.country} {member.city}</Text>
        </View>

        <Text style={styles.sectionTitle}>О себе</Text>
        <Text style={styles.bio}>{member.bio}</Text>

        <Text style={styles.sectionTitle}>Интересы</Text>
        <View style={styles.tags}>
          {member.interests.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {isConnected ? (
          <View style={styles.actions}>
            <View style={styles.successBanner}>
              <Text style={styles.successText}>✓ В ваших связях</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.messageButton, pressed && styles.buttonPressed]}
              onPress={() => onMessage(member.id)}
            >
              <Text style={styles.messageText}>Написать сообщение</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.connectButton, pressed && styles.buttonPressed]}
            onPress={() => onConnect(member.id)}
          >
            <Text style={styles.connectText}>Добавить в связи</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 8 },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingRight: 12,
  },
  backPressed: { opacity: 0.6 },
  backIcon: { fontSize: 20, color: '#7C3AED', marginRight: 4 },
  backLabel: { fontSize: 16, fontWeight: '500', color: '#7C3AED' },
  content: { paddingHorizontal: 24, paddingBottom: 32 },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#7C3AED' },
  name: { fontSize: 24, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  role: { fontSize: 15, color: '#64748B', marginBottom: 4 },
  city: { fontSize: 14, color: '#94A3B8' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 10,
  },
  bio: {
    fontSize: 15,
    lineHeight: 24,
    color: '#475569',
    marginBottom: 24,
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 32 },
  tag: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: { fontSize: 13, fontWeight: '500', color: '#7C3AED' },
  connectButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonPressed: { opacity: 0.9 },
  connectText: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },
  successBanner: {
    backgroundColor: '#F3E8FF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  successText: { fontSize: 16, fontWeight: '600', color: '#7C3AED' },
  actions: { gap: 12 },
  messageButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  messageText: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },
});
