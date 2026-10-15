import { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { getFirstName } from '../lib/profileUtils';
import { useI18n } from '../lib/i18n';
import { useTheme } from '../lib/ThemeContext';
import { isOwnPost } from '../lib/postUtils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PostDetailScreen({ post, profile, userId, onBack, onAddReply }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const [draft, setDraft] = useState('');
  const replies = post.replies ?? [];
  const cleanName = (post.author || '').replace(/\s*\(вы\)\s*$/, '');
  const displayName = isOwnPost(post, userId) ? `${cleanName} (вы)` : cleanName;

  const handleReply = async () => {
    const text = draft.trim();
    if (!text) return;
    const saved = await onAddReply(post.id, {
      id: String(Date.now()),
      author: getFirstName(profile),
      text,
      time: t('postDetail.justNow'),
    });
    if (saved) setDraft('');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: 8 + insets.top }]}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}
          onPress={onBack}
        >
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backLabel}>{t('postDetail.back')}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.postCard}>
          <View style={styles.postHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{cleanName.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.author}>{displayName}</Text>
              <Text style={styles.meta}>📍 {post.city} · {post.time}</Text>
            </View>
          </View>
          <Text style={styles.postContent}>{post.content}</Text>
          {post.imageUri ? (
            <Image source={{ uri: post.imageUri }} style={styles.postImage} resizeMode="cover" />
          ) : null}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{post.category}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          {t('postDetail.comments', { value: replies.length })}
        </Text>

        {replies.length === 0 ? (
          <Text style={styles.empty}>{t('postDetail.beFirstComment')}</Text>
        ) : (
          replies.map((reply) => (
            <View key={reply.id} style={styles.reply}>
              <Text style={styles.replyAuthor}>{reply.author}</Text>
              <Text style={styles.replyText}>{reply.text}</Text>
              <Text style={styles.replyTime}>{reply.time}</Text>
            </View>
          ))
        )}

        <View style={styles.compose}>
          <TextInput
            style={styles.composeInput}
            placeholder={t('postDetail.commentPlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={draft}
            onChangeText={setDraft}
            multiline
          />
          <Pressable
            style={({ pressed }) => [
              styles.sendButton,
              !draft.trim() && styles.sendDisabled,
              pressed && draft.trim() && styles.sendPressed,
            ]}
            onPress={handleReply}
            disabled={!draft.trim()}
          >
            <Text style={styles.sendText}>{t('postDetail.send')}</Text>
          </Pressable>
        </View>
      </ScrollView>
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
    header: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 8 },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingVertical: 6,
      paddingRight: 12,
    },
    backPressed: { opacity: 0.6 },
    backIcon: { fontSize: 20, color: '#2563EB', marginRight: 4 },
    backLabel: { fontSize: 16, fontWeight: '500', color: '#2563EB' },
    content: { paddingHorizontal: 24, paddingBottom: 32 },
    postCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    postHeader: { flexDirection: 'row', marginBottom: 14 },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#EFF6FF',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    avatarText: { fontSize: 18, fontWeight: '600', color: '#2563EB' },
    author: { fontSize: 16, fontWeight: '600', color: colors.text },
    meta: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
    postContent: { fontSize: 16, lineHeight: 24, color: colors.textSecondary, marginBottom: 12 },
    postImage: {
      width: '100%',
      height: 240,
      borderRadius: 12,
      marginBottom: 12,
      backgroundColor: colors.surfaceMuted,
    },
    categoryBadge: {
      alignSelf: 'flex-start',
      backgroundColor: colors.surfaceMuted,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
    },
    categoryText: { fontSize: 12, fontWeight: '500', color: colors.textSecondary },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    empty: { fontSize: 14, color: colors.textMuted, marginBottom: 20 },
    reply: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
    },
    replyAuthor: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 4 },
    replyText: { fontSize: 14, lineHeight: 20, color: colors.textSecondary, marginBottom: 6 },
    replyTime: { fontSize: 12, color: colors.textMuted },
    compose: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginTop: 12,
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    composeInput: {
      fontSize: 15,
      color: colors.text,
      minHeight: 50,
      marginBottom: 12,
      textAlignVertical: 'top',
    },
    sendButton: {
      backgroundColor: '#2563EB',
      borderRadius: 10,
      paddingVertical: 10,
      alignItems: 'center',
      alignSelf: 'flex-end',
      paddingHorizontal: 20,
    },
    sendDisabled: { backgroundColor: colors.border },
    sendPressed: { opacity: 0.9 },
    sendText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  });
}
