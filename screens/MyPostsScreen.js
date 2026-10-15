import { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useI18n } from '../lib/i18n';
import { useTheme } from '../lib/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function PostRow({ post, onPress }) {
  const styles = useStyles();
  const replyCount = post.replies?.length ?? 0;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(post.id)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.category}>{post.category}</Text>
        <Text style={styles.time}>{post.time}</Text>
      </View>
      <Text style={styles.content} numberOfLines={4}>
        {post.content}
      </Text>
      <Text style={styles.meta}>
        ❤️ {post.likes} · 💬 {replyCount}
      </Text>
    </Pressable>
  );
}

export default function MyPostsScreen({ posts, onBack, onOpenPost, onOpenCreatePost }) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: 16 + insets.top }]}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}
          onPress={onBack}
        >
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backLabel}>{t('myPosts.backLabel')}</Text>
        </Pressable>
        <Text style={styles.screenTitle}>{t('myPosts.title')}</Text>
        <Text style={styles.screenSubtitle}>
          {posts.length} {posts.length === 1 ? t('myPosts.postCountSingular') : t('myPosts.postCountPlural')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        <Pressable
          style={({ pressed }) => [styles.composeButton, pressed && styles.cardPressed]}
          onPress={onOpenCreatePost}
        >
          <Text style={styles.composeButtonText}>＋ {t('myPosts.writePost')}</Text>
        </Pressable>

        {posts.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyTitle}>{t('myPosts.emptyTitle')}</Text>
            <Text style={styles.emptyText}>
              {t('myPosts.emptyText')}
            </Text>
          </View>
        ) : (
          posts.map((post) => (
            <PostRow key={post.id} post={post} onPress={onOpenPost} />
          ))
        )}
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
    backIcon: { fontSize: 20, color: colors.accent, marginRight: 4 },
    backLabel: { fontSize: 16, fontWeight: '500', color: colors.accent },
    screenTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.5,
      marginBottom: 6,
    },
    screenSubtitle: { fontSize: 15, color: colors.textSecondary },
    list: { paddingHorizontal: 24, paddingBottom: 16, gap: 12 },
    composeButton: {
      backgroundColor: colors.accent,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
      marginBottom: 4,
    },
    composeButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 18,
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    cardPressed: { opacity: 0.92 },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    category: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.accent,
      backgroundColor: colors.accentSoft,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      overflow: 'hidden',
    },
    time: { fontSize: 13, color: colors.textMuted },
    content: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.text,
      marginBottom: 10,
    },
    meta: { fontSize: 13, color: colors.textSecondary },
    empty: { alignItems: 'center', paddingTop: 48 },
    emptyEmoji: { fontSize: 48, marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: 8 },
    emptyText: {
      fontSize: 15,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 22,
      paddingHorizontal: 32,
    },
  });
}
