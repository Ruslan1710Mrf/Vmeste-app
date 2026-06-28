import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useI18n } from '../lib/i18n';

function PostRow({ post, onPress }) {
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
  const { t } = useI18n();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
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
  list: { paddingHorizontal: 24, paddingBottom: 16, gap: 12 },
  composeButton: {
    backgroundColor: '#EA580C',
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
    backgroundColor: '#FFFFFF',
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
    color: '#EA580C',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  time: { fontSize: 13, color: '#94A3B8' },
  content: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1E293B',
    marginBottom: 10,
  },
  meta: { fontSize: 13, color: '#64748B' },
  empty: { alignItems: 'center', paddingTop: 48 },
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
