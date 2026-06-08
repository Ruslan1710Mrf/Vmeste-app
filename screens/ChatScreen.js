import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { formatChatTime } from '../lib/chatUtils';

export default function ChatScreen({ member, messages, onSendMessage, onBack }) {
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!messages.length) return;
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    onSendMessage(text);
    setDraft('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}
          onPress={onBack}
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{member.name}</Text>
          <Text style={styles.role}>{member.role}</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        {messages.length === 0 ? (
          <Text style={styles.emptyHint}>Напишите первое сообщение</Text>
        ) : (
          messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageWrap,
                msg.from === 'me' ? styles.messageWrapMe : styles.messageWrapThem,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  msg.from === 'me' ? styles.bubbleMe : styles.bubbleThem,
                ]}
              >
                <Text
                  style={[
                    styles.bubbleText,
                    msg.from === 'me' && styles.bubbleTextMe,
                  ]}
                >
                  {msg.text}
                </Text>
              </View>
              {msg.time ? (
                <Text style={styles.messageTime}>{formatChatTime(msg.time)}</Text>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Сообщение..."
          placeholderTextColor="#94A3B8"
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backButton: { padding: 8, marginRight: 8 },
  backPressed: { opacity: 0.6 },
  backIcon: { fontSize: 22, color: '#EA580C' },
  headerInfo: { flex: 1 },
  name: { fontSize: 17, fontWeight: '600', color: '#1E293B' },
  role: { fontSize: 13, color: '#94A3B8' },
  messages: { flex: 1 },
  messagesContent: { padding: 16, gap: 4 },
  emptyHint: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 15,
    marginTop: 40,
  },
  messageWrap: { marginBottom: 10, maxWidth: '82%' },
  messageWrapMe: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  messageWrapThem: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleMe: {
    backgroundColor: '#EA580C',
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleText: { fontSize: 15, lineHeight: 20, color: '#1E293B' },
  bubbleTextMe: { color: '#FFFFFF' },
  messageTime: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    marginHorizontal: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1E293B',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendPressed: { opacity: 0.85 },
  sendIcon: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
});
