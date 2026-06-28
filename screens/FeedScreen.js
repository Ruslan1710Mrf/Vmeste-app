import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getMemberByAuthorName } from '../data/members';
import { FEED_CATEGORIES } from '../lib/interestUtils';
import { useI18n } from '../lib/i18n';

function PostCard({
  post,
  isLiked,
  onPress,
  onCommentPress,
  onToggleLike,
  onOpenAuthor,
  onOpenMenu,
}) {
  const { t } = useI18n();
  const replyCount = post.replies?.length ?? 0;
  const likes = post.likes + (isLiked ? 1 : 0);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Pressable
          style={({ pressed }) => [styles.authorPressable, pressed && styles.cardPressed]}
          onPress={() => onOpenAuthor(post)}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{post.author.charAt(0)}</Text>
          </View>
          <View style={styles.authorInfo}>
            <Text style={styles.author}>{post.author}</Text>
            <Text style={styles.meta}>📍 {post.city} · {post.time}</Text>
          </View>
        </Pressable>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{post.category}</Text>
        </View>
        <Pressable hitSlop={8} style={styles.menuButton} onPress={() => onOpenMenu(post)}>
          <Text style={styles.menuText}>•••</Text>
        </Pressable>
      </View>
      <Pressable
        style={({ pressed }) => [pressed && styles.cardPressed]}
        onPress={() => onPress(post.id)}
      >
        <Text style={styles.content} numberOfLines={4}>{post.content}</Text>
        {post.imageUri ? (
          <Image source={{ uri: post.imageUri }} style={styles.postImage} resizeMode="cover" />
        ) : null}
      </Pressable>
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
          onPress={() => onToggleLike(post.id)}
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
    </View>
  );
}

export default function FeedScreen({
  posts,
  likedPostIds,
  onBack,
  onOpenCreatePost,
  onSelectPost,
  onOpenMember,
  onOpenOwnProfile,
  onToggleLike,
  onOpenPostMenu,
  onRefresh,
  backLabel,
  initialCategory = 'Все',
  feedTitle,
  feedSubtitle,
}) {
  const { t } = useI18n();
  const resolvedBackLabel = backLabel ?? t('feed.backLabel');
  const resolvedFeedTitle = feedTitle ?? t('feed.title');
  const resolvedFeedSubtitle = feedSubtitle ?? t('feed.subtitle');
  const [category, setCategory] = useState(initialCategory);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setCategory(initialCategory);
  }, [initialCategory]);

  const filtered = useMemo(() => {
    if (category === 'Все') return posts;
    return posts.filter((p) => p.category === category);
  }, [posts, category]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh?.();
    setRefreshing(false);
  };

  const handleOpenAuthor = (post) => {
    if (post.author?.includes('(вы)')) {
      onOpenOwnProfile?.();
      return;
    }
    const member = getMemberByAuthorName(post.author);
    if (member) {
      onOpenMember(member.id);
    }
  };

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
        <Text style={styles.screenTitle}>{resolvedFeedTitle}</Text>
        <Text style={styles.screenSubtitle}>{resolvedFeedSubtitle}</Text>
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
          {FEED_CATEGORIES.map((cat) => (
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

        <Pressable
          style={({ pressed }) => [styles.composeButton, pressed && styles.composeButtonPressed]}
          onPress={onOpenCreatePost}
        >
          <Text style={styles.composeButtonText}>＋ {t('feed.writePost')}</Text>
        </Pressable>

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyTitle}>{t('feed.emptyTitle')}</Text>
            <Text style={styles.emptyText}>{t('feed.emptyText')}</Text>
          </View>
        ) : (
          filtered.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isLiked={likedPostIds.includes(post.id)}
              onPress={onSelectPost}
              onOpenAuthor={handleOpenAuthor}
              onCommentPress={onSelectPost}
              onToggleLike={onToggleLike}
              onOpenMenu={onOpenPostMenu}
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
  composeButton: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 4,
  },
  composeButtonPressed: { opacity: 0.9 },
  composeButtonText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
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
  authorPressable: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', marginRight: 8 },
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
  menuButton: { paddingHorizontal: 6, paddingVertical: 4, marginLeft: 6 },
  menuText: { fontSize: 16, color: '#94A3B8', letterSpacing: 1 },
  content: { fontSize: 15, lineHeight: 22, color: '#475569', marginBottom: 14 },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 14,
    backgroundColor: '#F1F5F9',
  },
  actions: { flexDirection: 'row', gap: 20 },
  action: { paddingVertical: 4 },
  actionPressed: { opacity: 0.6 },
  actionText: { fontSize: 14, color: '#64748B' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: '#1E293B', marginBottom: 6 },
  emptyText: { fontSize: 14, color: '#94A3B8', textAlign: 'center' },
});
