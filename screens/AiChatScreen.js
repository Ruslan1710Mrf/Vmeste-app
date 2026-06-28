import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { auth } from '../lib/firebase';
import { formatChatTime } from '../lib/chatUtils';
import { sendImmigrationChat } from '../lib/claudeApi';
import { fetchAiChatMessages, saveAiChatMessage } from '../lib/aiChatService';
import AiHeaderIcon from '../components/icons/AiHeaderIcon';
import { useTheme } from '../lib/ThemeContext';
import { useI18n } from '../lib/i18n';

export default function AiChatScreen({ userId }) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const SUGGESTIONS = [
    t('aiChat.suggestion1'),
    t('aiChat.suggestion2'),
    t('aiChat.suggestion3'),
  ];
  const scrollRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const chatUserId = auth.currentUser?.uid ?? userId ?? null;

  useEffect(() => {
    if (!chatUserId) {
      setMessages([]);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    fetchAiChatMessages(chatUserId)
      .then((saved) => {
        if (!cancelled) setMessages(saved);
      })
      .catch(() => {
        if (!cancelled) setMessages([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [chatUserId]);

  useEffect(() => {
    if (!messages.length) return;
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages.length, sending]);

  const persistMessage = async (message) => {
    try {
      return await saveAiChatMessage(chatUserId, message);
    } catch {
      return {
        id: String(Date.now()) + Math.random().toString(36).slice(2, 6),
        ...message,
      };
    }
  };

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    if (!chatUserId) {
      setError(t('aiChat.signInRequired'));
      return;
    }

    setError('');
    setSending(true);
    setDraft('');

    const createdAt = new Date().toISOString();
    const userMessage = await persistMessage({
      role: 'user',
      content: trimmed,
      createdAt,
    });

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);

    try {
      const replyText = await sendImmigrationChat(
        nextMessages.map((msg) => ({ role: msg.role, content: msg.content })),
      );
      const assistantMessage = await persistMessage({
        role: 'assistant',
        content: replyText,
        createdAt: new Date().toISOString(),
      });
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setError(t('aiChat.responseError'));
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
      setDraft(trimmed);
    } finally {
      setSending(false);
    }
  };

  const send = () => sendMessage(draft);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
    >
      <View style={styles.header}>
        <View style={styles.headerAvatar}>
          <AiHeaderIcon size={44} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{t('aiChat.title')}</Text>
          <Text style={styles.subtitle}>{t('aiChat.subtitle')}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>{t('aiChat.emptyTitle')}</Text>
              <Text style={styles.emptyHint}>
                {t('aiChat.emptyHint')}
              </Text>
              <View style={styles.suggestions}>
                {SUGGESTIONS.map((suggestion) => (
                  <Pressable
                    key={suggestion}
                    style={({ pressed }) => [
                      styles.suggestionChip,
                      pressed && styles.suggestionPressed,
                    ]}
                    onPress={() => sendMessage(suggestion)}
                    disabled={sending}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageWrap,
                  msg.role === 'user' ? styles.messageWrapMe : styles.messageWrapThem,
                ]}
              >
                {msg.role === 'assistant' ? (
                  <View style={styles.assistantLabelRow}>
                    <AiHeaderIcon size={14} />
                    <Text style={styles.assistantLabel}>AI</Text>
                  </View>
                ) : null}
                <View
                  style={[
                    styles.bubble,
                    msg.role === 'user' ? styles.bubbleMe : styles.bubbleThem,
                  ]}
                >
                  <Text
                    style={[
                      styles.bubbleText,
                      msg.role === 'user' && styles.bubbleTextMe,
                    ]}
                  >
                    {msg.content}
                  </Text>
                </View>
                {msg.createdAt ? (
                  <Text style={styles.messageTime}>{formatChatTime(msg.createdAt)}</Text>
                ) : null}
              </View>
            ))
          )}
          {sending ? (
            <View style={styles.typingWrap}>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text style={styles.typingText}>{t('aiChat.typing')}</Text>
            </View>
          ) : null}
        </ScrollView>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder={t('aiChat.inputPlaceholder')}
          placeholderTextColor={colors.textMuted}
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={send}
          editable={!sending}
          multiline
        />
        <Pressable
          style={({ pressed }) => [
            styles.sendButton,
            pressed && styles.sendPressed,
            (!draft.trim() || sending) && styles.sendDisabled,
          ]}
          onPress={send}
          disabled={!draft.trim() || sending}
        >
          <Text style={styles.sendIcon}>↑</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    headerAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#041E2A',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    headerInfo: {
      flex: 1,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    loadingWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    messages: {
      flex: 1,
    },
    messagesContent: {
      padding: 16,
      gap: 4,
      flexGrow: 1,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 24,
      gap: 12,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    emptyHint: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSecondary,
      textAlign: 'center',
      paddingHorizontal: 12,
    },
    suggestions: {
      width: '100%',
      gap: 8,
      marginTop: 8,
    },
    suggestionChip: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    suggestionPressed: {
      backgroundColor: colors.pressed,
    },
    suggestionText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    messageWrap: {
      marginBottom: 10,
      maxWidth: '88%',
    },
    messageWrapMe: {
      alignSelf: 'flex-end',
      alignItems: 'flex-end',
    },
    messageWrapThem: {
      alignSelf: 'flex-start',
      alignItems: 'flex-start',
    },
    assistantLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 4,
      marginLeft: 2,
    },
    assistantLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: '#00E5FF',
    },
    bubble: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 18,
    },
    bubbleMe: {
      backgroundColor: colors.accent,
      borderBottomRightRadius: 4,
    },
    bubbleThem: {
      backgroundColor: colors.surface,
      borderBottomLeftRadius: 4,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    bubbleText: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.text,
    },
    bubbleTextMe: {
      color: '#FFFFFF',
    },
    messageTime: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 4,
      marginHorizontal: 4,
    },
    typingWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 8,
    },
    typingText: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    errorText: {
      color: '#EF4444',
      fontSize: 13,
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      gap: 10,
    },
    input: {
      flex: 1,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 22,
      paddingHorizontal: 16,
      paddingVertical: 10,
      fontSize: 15,
      color: colors.text,
      maxHeight: 120,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendPressed: {
      opacity: 0.85,
    },
    sendDisabled: {
      opacity: 0.45,
    },
    sendIcon: {
      fontSize: 20,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });
}
