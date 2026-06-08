import { useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const CATEGORIES = ['Все', 'Карьера', 'Иммиграция', 'Стартапы', 'Жизнь в США', 'Сообщество'];

function PostCard({ post, isLiked, onPress, onCommentPress, onToggleLike }) {
  const replyCount = post.replies?.length ?? 0;
  const likes = post.likes + (isLiked ? 1 : 0);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(post.id)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{post.author.charAt(0)}</Text>
        </View>
        <View style={styles.authorInfo}>
          <Text style={styles.author}>{post.author}</Text>
          <Text style={styles.meta}>📍 {post.city} · {post.time}</Text>
        </View>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{post.category}</Text>
        </View>
      </View>
      <Text style={styles.content} numberOfLines={4}>{post.content}</Text>
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
          onPress={(e) => {
            e?.stopPropagation?.();
            onToggleLike(post.id);
          }}
        >
          <Text style={styles.actionText}>{isLiked ? '❤️' : '🤍'} {likes}</Text>
        </Pressable>
        <Pressable
          style={styles.action}
          onPress={() => onCommentPress(post.id)}
        >
          <Text style={styles.actionText}>💬 {replyCount}</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function FeedScreen({
  posts,
  likedPostIds,
  onBack,
  onAddPost,
  onSelectPost,
  onToggleLike,
  onRefresh,
  backLabel = 'Главная',
}) {
  const [draft, setDraft] = useState('');
  const [category, setCategory] = useState('Все');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    if (category === 'Все') return posts;
    return posts.filter((p) => p.category === category);
  }, [posts, category]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh?.();
    setRefreshing(false);
  };

  const handlePost = () => {
    const text = draft.trim();
    if (!text) return;
    onAddPost(text);
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
          <Text style={styles.backLabel}>{backLabel}</Text>
        </Pressable>
        <Text style={styles.screenTitle}>Лента</Text>
        <Text style={styles.screenSubtitle}>Посты от сообщества</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filters}
        >
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              style={[styles.filterChip, category === cat && styles.filterChipActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.filterText, category === cat && styles.filterTextActive]}>
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.compose}>
          <TextInput
            style={styles.composeInput}
            placeholder="Поделитесь с сообществом..."
            placeholderTextColor="#94A3B8"
            value={draft}
            onChangeText={setDraft}
            multiline
          />
          <Pressable
            style={({ pressed }) => [
              styles.postButton,
              !draft.trim() && styles.postButtonDisabled,
              pressed && draft.trim() && styles.postButtonPressed,
            ]}
            onPress={handlePost}
            disabled={!draft.trim()}
          >
            <Text style={styles.postButtonText}>Опубликовать</Text>
          </Pressable>
        </View>

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyTitle}>Нет постов в этой категории</Text>
            <Text style={styles.emptyText}>Попробуйте другой фильтр или напишите первым</Text>
          </View>
        ) : (
          filtered.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isLiked={likedPostIds.includes(post.id)}
              onPress={onSelectPost}
              onCommentPress={onSelectPost}
              onToggleLike={onToggleLike}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12 },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 12,
    paddingVertical: 6,
    paddingRight: 12,
  },
  backPressed: { opacity: 0.6 },
  backIcon: { fontSize: 20, color: '#2563EB', marginRight: 4 },
  backLabel: { fontSize: 16, fontWeight: '500', color: '#2563EB' },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  screenSubtitle: { fontSize: 15, color: '#64748B' },
  list: { paddingHorizontal: 24, paddingBottom: 16, gap: 12 },
  filtersScroll: { marginHorizontal: -24, marginBottom: 12 },
  filters: { paddingHorizontal: 24, gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  filterText: { fontSize: 13, fontWeight: '500', color: '#64748B' },
  filterTextActive: { color: '#FFFFFF' },
  compose: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  composeInput: {
    fontSize: 15,
    color: '#1E293B',
    minHeight: 60,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  postButton: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingHorizontal: 20,
  },
  postButtonDisabled: { backgroundColor: '#CBD5E1' },
  postButtonPressed: { opacity: 0.9 },
  postButtonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
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
  cardPressed: { opacity: 0.95 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 16, fontWeight: '600', color: '#2563EB' },
  authorInfo: { flex: 1 },
  author: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  meta: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  categoryBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: { fontSize: 11, fontWeight: '500', color: '#64748B' },
  content: { fontSize: 15, lineHeight: 22, color: '#475569', marginBottom: 14 },
  actions: { flexDirection: 'row', gap: 20 },
  action: { paddingVertical: 4 },
  actionPressed: { opacity: 0.6 },
  actionText: { fontSize: 14, color: '#64748B' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: '#1E293B', marginBottom: 6 },
  emptyText: { fontSize: 14, color: '#94A3B8', textAlign: 'center' },
});
