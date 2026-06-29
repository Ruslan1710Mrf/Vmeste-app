import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { formatChatTime } from '../lib/chatUtils';
import { auth } from '../lib/firebase';
import { deleteConversation, subscribeToConversations } from '../lib/messageService';
import { fetchUsersByIds } from '../lib/userProfileService';
import { useI18n } from '../lib/i18n';

function getOtherParticipant(conv, myUid) {
  return conv.participants.find((id) => id !== myUid) ?? null;
}

function ConversationRow({ conv, myUid, onPress, onDelete }) {
  const { t } = useI18n();
  const otherUid = getOtherParticipant(conv, myUid);
  if (!otherUid) return null;

  const name = conv.participantNames[otherUid] || t('messages.defaultUserName');
  const preview = conv.lastMessage?.trim() || t('messages.startConversation');
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
      <Pressable
        style={({ pressed }) => [styles.deleteButton, pressed && styles.deleteButtonPressed]}
        onPress={() => onDelete(conv)}
        hitSlop={8}
      >
        <Text style={styles.deleteIcon}>🗑</Text>
      </Pressable>
    </Pressable>
  );
}

function FriendRow({ member, onPress }) {
  const { t } = useI18n();
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
        <Text style={styles.preview} numberOfLines={1}>{member.role || t('networking.communityMember')}</Text>
      </View>
      <Text style={styles.friendMsgIcon}>💬</Text>
    </Pressable>
  );
}

export default function MessagesScreen({
  onBack,
  backLabel,
  onOpenChat,
  userId,
  connectedIds = [],
  blockedUserIds = [],
}) {
  const { t } = useI18n();
  const resolvedBackLabel = backLabel ?? t('messages.backLabel');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [connections, setConnections] = useState([]);
  const myUid = auth.currentUser?.uid ?? userId ?? null;

  useEffect(() => {
    let cancelled = false;
    fetchUsersByIds(connectedIds)
      .then((members) => {
        if (!cancelled) setConnections(members.filter((m) => !blockedUserIds.includes(m.id)));
      })
      .catch(() => {
        if (!cancelled) setConnections([]);
      });
    return () => {
      cancelled = true;
    };
  }, [connectedIds, blockedUserIds]);

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

  const handleDeleteConversation = (conv) => {
    const removeConversation = async () => {
      try {
        await deleteConversation(conv.id);
        setConversations((prev) => prev.filter((c) => c.id !== conv.id));
      } catch {
        Alert.alert(t('messages.errorTitle'), t('messages.deleteConversationError'));
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`${t('messages.deleteConversationConfirmTitle')} ${t('messages.deleteConversationConfirmMessage')}`)) {
        void removeConversation();
      }
      return;
    }

    Alert.alert(t('messages.deleteConversationConfirmTitle'), t('messages.deleteConversationConfirmMessage'), [
      { text: t('messages.cancel'), style: 'cancel' },
      { text: t('messages.delete'), style: 'destructive', onPress: () => void removeConversation() },
    ]);
  };

  const visibleConversations = conversations.filter((conv) => {
    const otherUid = getOtherParticipant(conv, myUid);
    return !otherUid || !blockedUserIds.includes(otherUid);
  });

  const showFriendsList = !loading
    && (composing || (visibleConversations.length === 0 && connections.length > 0));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}
          onPress={onBack}
        >
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backLabel}>{resolvedBackLabel}</Text>
        </Pressable>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.screenTitle}>{t('messages.title')}</Text>
            <Text style={styles.screenSubtitle}>
              {t('messages.conversationsCount', { value: visibleConversations.length })}
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
            {composing ? <Text style={styles.sectionLabel}>{t('messages.chooseFriend')}</Text> : null}
            <View style={styles.card}>
              {connections.map((member, index) => (
                <View key={member.id}>
                  <FriendRow member={member} onPress={handleSelectFriend} />
                  {index < connections.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </>
        ) : visibleConversations.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyTitle}>{t('messages.emptyTitle')}</Text>
            <Text style={styles.emptyText}>
              {!myUid
                ? t('messages.signInToMessage')
                : t('messages.addFriendsToStart')}
            </Text>
          </View>
        ) : (
          <View style={styles.card}>
            {visibleConversations.map((conv, index) => (
              <View key={conv.id}>
                <ConversationRow
                  conv={conv}
                  myUid={myUid}
                  onPress={onOpenChat}
                  onDelete={handleDeleteConversation}
                />
                {index < visibleConversations.length - 1 && <View style={styles.divider} />}
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
  deleteButton: { padding: 8, marginLeft: 4 },
  deleteButtonPressed: { opacity: 0.6 },
  deleteIcon: { fontSize: 16 },
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
