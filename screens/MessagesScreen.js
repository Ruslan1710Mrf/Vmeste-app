import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getMemberById } from '../data/members';
import { getConversationPreview } from '../lib/chatUtils';

function ConversationRow({ member, chatThreads, onPress }) {
  const preview = getConversationPreview(chatThreads[member.id]);

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={() => onPress(member.id)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{member.name.charAt(0)}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.name}>{member.name}</Text>
          <Text style={styles.time}>{preview.time}</Text>
        </View>
        <Text style={styles.preview} numberOfLines={1}>{preview.preview}</Text>
      </View>
    </Pressable>
  );
}

export default function MessagesScreen({ connectedIds, chatThreads, onBack, onOpenChat }) {
  const conversations = connectedIds
    .map(getMemberById)
    .filter(Boolean)
    .sort((a, b) => {
      const aKey = getConversationPreview(chatThreads[a.id]).sortKey;
      const bKey = getConversationPreview(chatThreads[b.id]).sortKey;
      return bKey - aKey;
    });

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
        <Text style={styles.screenTitle}>Сообщения</Text>
        <Text style={styles.screenSubtitle}>
          {conversations.length} диалогов
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {conversations.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyTitle}>Пока нет сообщений</Text>
            <Text style={styles.emptyText}>
              Добавьте людей в связи через раздел «Нетворкинг», чтобы начать переписку
            </Text>
          </View>
        ) : (
          <View style={styles.card}>
            {conversations.map((member, index) => (
              <View key={member.id}>
                <ConversationRow
                  member={member}
                  chatThreads={chatThreads}
                  onPress={onOpenChat}
                />
                {index < conversations.length - 1 && <View style={styles.divider} />}
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
  row: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  rowPressed: { backgroundColor: '#F8FAFC' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: { fontSize: 18, fontWeight: '600', color: '#EA580C' },
  content: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  name: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  time: { fontSize: 12, color: '#94A3B8' },
  preview: { fontSize: 14, color: '#64748B' },
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
