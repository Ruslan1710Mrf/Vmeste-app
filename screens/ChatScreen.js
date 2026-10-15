import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { containsObjectionableContent } from '../utils/contentFilter';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth } from '../lib/firebase';
import {
  ensureConversation,
  sendMessage,
  subscribeToMessages,
} from '../lib/messageService';
import MemberOptionsMenu from '../components/MemberOptionsMenu';
import { useI18n } from '../lib/i18n';
import { useTheme } from '../lib/ThemeContext';

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatScreen({
  member,
  onBack,
  myName = '',
  userId,
  onOpenMember,
  isBlocked,
  onBlock,
  onUnblock,
  onReport,
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [convId, setConvId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendError, setSendError] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const scrollRef = useRef(null);
  const myUid = auth.currentUser?.uid ?? userId ?? null;

  useEffect(() => {
    if (!myUid) {
      setConvId(null);
      setLoading(false);
      return undefined;
    }

    let unsub = () => {};
    setLoading(true);
    setSendError('');

    ensureConversation(myUid, member.id, member.name, myName)
      .then((id) => {
        setConvId(id);
        unsub = subscribeToMessages(id, (msgs) => {
          setMessages(msgs);
          setLoading(false);
        });
      })
      .catch((error) => {
        console.error('[ChatScreen] ensureConversation failed', error);
        setConvId(null);
        setLoading(false);
        setSendError(t('chat.openChatError'));
      });

    return () => unsub();
  }, [member.id, myUid, myName, member.name]);

  useEffect(() => {
    if (!messages.length) return;
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  const send = async () => {
    const text = draft.trim();

    if (!text || !myUid) return;

    if (containsObjectionableContent(text)) {
      Alert.alert(
        t('app.objectionableContentTitle'),
        t('app.objectionableContentError'),
      );
      return;
    }

    if (!convId) {
      setSendError(t('chat.chatLoadingError'));
      return;
    }

    setSendError('');
    const previousDraft = draft;
    setDraft('');

    try {
      await sendMessage(convId, myUid, text);
    } catch {
      setDraft(previousDraft);
      setSendError(t('chat.sendMessageError'));
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}
          onPress={onBack}
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Pressable
          style={styles.headerInfo}
          onPress={onOpenMember ? () => onOpenMember(member.id) : undefined}
        >
          <Text style={styles.name}>{member.name}</Text>
          <Text style={styles.role}>{member.role ?? ''}</Text>
        </Pressable>
        <Pressable hitSlop={8} onPress={() => setShowMenu(true)}>
          <Text style={styles.menuDots}>•••</Text>
        </Pressable>
      </View>

      <MemberOptionsMenu
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        isBlocked={isBlocked}
        onBlock={() => {
          setShowMenu(false);
          onBlock?.();
          onBack?.();
        }}
        onUnblock={() => {
          setShowMenu(false);
          onUnblock?.();
        }}
        onReport={() => {
          setShowMenu(false);
          onReport?.();
        }}
      />

      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={colors.accent} />
        ) : messages.length === 0 ? (
          <Text style={styles.emptyHint}>{t('chat.writeFirstMessage')}</Text>
        ) : (
          messages.map((msg) => {
            const isMe = msg.fromUid === myUid;
            return (
              <View
                key={msg.id}
                style={[
                  styles.messageWrap,
                  isMe ? styles.messageWrapMe : styles.messageWrapThem,
                ]}
              >
                <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                  <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
                    {msg.text}
                  </Text>
                </View>
                <Text style={styles.messageTime}>{formatTime(msg.createdAt)}</Text>
              </View>
            );
          })
        )}
      </ScrollView>

      {sendError ? <Text style={styles.sendError}>{sendError}</Text> : null}

      <View style={[styles.inputRow, { paddingBottom: 12 + insets.bottom }]}>
        <TextInput
          style={styles.input}
          placeholder={t('chat.messagePlaceholder')}
          placeholderTextColor={colors.textMuted}
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={send}
        />
        <Pressable
          style={({ pressed }) => [styles.sendButton, pressed && styles.sendPressed]}
          onPress={send}
        >
          <Text style={styles.sendIcon}>↑</Text>
        </Pressable>
      </View>
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    backButton: { padding: 8, marginRight: 8 },
    backPressed: { opacity: 0.6 },
    backIcon: { fontSize: 22, color: colors.accent },
    headerInfo: { flex: 1 },
    menuDots: { fontSize: 18, color: colors.textSecondary, letterSpacing: 1, padding: 8 },
    name: { fontSize: 17, fontWeight: '600', color: colors.text },
    role: { fontSize: 13, color: colors.textMuted },
    messages: { flex: 1 },
    messagesContent: { padding: 16, gap: 4 },
    emptyHint: { textAlign: 'center', color: colors.textMuted, fontSize: 15, marginTop: 40 },
    messageWrap: { marginBottom: 10, maxWidth: '82%' },
    messageWrapMe: { alignSelf: 'flex-end', alignItems: 'flex-end' },
    messageWrapThem: { alignSelf: 'flex-start', alignItems: 'flex-start' },
    bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
    bubbleMe: { backgroundColor: colors.accent, borderBottomRightRadius: 4 },
    bubbleThem: {
      backgroundColor: colors.surface,
      borderBottomLeftRadius: 4,
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    },
    bubbleText: { fontSize: 15, lineHeight: 20, color: colors.text },
    bubbleTextMe: { color: '#FFFFFF' },
    messageTime: { fontSize: 11, color: colors.textMuted, marginTop: 4, marginHorizontal: 4 },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 10,
    },
    input: {
      flex: 1,
      backgroundColor: colors.surfaceMuted,
      borderRadius: 22,
      paddingHorizontal: 16,
      paddingVertical: 10,
      fontSize: 15,
      color: colors.text,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendPressed: { opacity: 0.85 },
    sendIcon: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
    sendError: {
      color: '#EF4444',
      fontSize: 13,
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
  });
}
