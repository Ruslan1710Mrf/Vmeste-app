import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getMemberById } from '../data/members';
import { formatChatTime } from '../lib/chatUtils';
import { auth } from '../lib/firebase';
import { subscribeToConversations } from '../lib/messageService';

function getOtherParticipant(conv, myUid) {
  return conv.participants.find((id) => id !== myUid) ?? null;
}

function ConversationRow({ conv, myUid, onPress }) {
  const otherUid = getOtherParticipant(conv, myUid);
  if (!otherUid) return null;

  const member = getMemberById(otherUid);
  const name = conv.participantNames[otherUid] || member?.name || 'Пользователь';
  const preview = conv.lastMessage?.trim() || 'Начните переписку';
  const time = formatChatTime(conv.lastMessageAt);

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={() => onPress(otherUid)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{name.charAt(0)}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.time}>{time}</Text>
        </View>
        <Text style={styles.preview} numberOfLines={1}>{preview}</Text>
      </View>
    </Pressable>
  );
}

function FriendRow({ member, onPress }) {
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
        <Text style={styles.preview} numberOfLines={1}>{member.role}</Text>
      </View>
      <Text style={styles.friendMsgIcon}>💬</Text>
    </Pressable>
  );
}

export default function MessagesScreen({
  onBack,
  backLabel = 'Профиль',
  onOpenChat,
  userId,
  connectedIds = [],
}) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const myUid = auth.currentUser?.uid ?? userId ?? null;
  const connections = connectedIds.map(getMemberById).filter(Boolean);

  useEffect(() => {
    if (!myUid) {
      setConversations([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const unsub = subscribeToConversations(myUid, (convs) => {
      setConversations(convs);
      setLoading(false);
    });
    return unsub;
  }, [myUid]);

  const handleSelectFriend = (memberId) => {
    setComposing(false);
    onOpenChat(memberId);
  };

  const showFriendsList = !loading
    && (composing || (conversations.length === 0 && connections.length > 0));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}
          onPress={onBack}
        >
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backLabel}>{backLabel}</Text>
        </Pressable>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.screenTitle}>Сообщения</Text>
            <Text style={styles.screenSubtitle}>
              {conversations.length} диалогов
            </Text>
          </View>
          {connections.length > 0 ? (
            <Pressable
              style={({ pressed }) => [styles.composeButton, pressed && styles.backPressed]}
              onPress={() => setComposing((prev) => !prev)}
            >
              <Text style={styles.composeIcon}>{composing ? '✕' : '✏️'}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color="#EA580C" />
        ) : showFriendsList ? (
          <>
            {composing ? <Text style={styles.sectionLabel}>Выберите друга</Text> : null}
            <View style={styles.card}>
              {connections.map((member, index) => (
                <View key={member.id}>
                  <FriendRow member={member} onPress={handleSelectFriend} />
                  {index < connections.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </>
        ) : conversations.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyTitle}>Пока нет сообщений</Text>
            <Text style={styles.emptyText}>
              {!myUid
                ? 'Войдите в аккаунт, чтобы отправлять и получать сообщения'
                : 'Добавьте друзей в разделе «Нетворкинг», чтобы начать переписку'}
            </Text>
          </View>
        ) : (
          <View style={styles.card}>
            {conversations.map((conv, index) => (
              <View key={conv.id}>
                <ConversationRow
                  conv={conv}
                  myUid={myUid}
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
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  composeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  composeIcon: { fontSize: 18 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  friendMsgIcon: { fontSize: 18 },
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
