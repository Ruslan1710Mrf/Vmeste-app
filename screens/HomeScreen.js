import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getMemberByAuthorName } from '../data/members';
import { isOwnPost } from '../lib/postUtils';
import { getPostShareUrl } from '../lib/sharePost';
import ShareSheet from '../components/ShareSheet';
import Avatar from '../components/Avatar';
import Icon from '../components/Icon';
import { useTheme } from '../lib/ThemeContext';
import { useI18n } from '../lib/i18n';
import { fetchRecentUsers } from '../lib/userProfileService';



function TopHeader({ styles, insets, onOpenSearch, onOpenMessages, onOpenNotifications, unreadCount, messagesCount }) {
  const { t } = useI18n();
  return (
    <View style={[styles.topBar, { paddingTop: 8 + (insets?.top ?? 0) }]}>
      <Text style={styles.screenTitle}>VMESTE</Text>
      <View style={styles.topActions}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('home.search')} style={styles.topAction} onPress={onOpenSearch}>
          <Icon name="search" />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={t('home.messages')} style={styles.topAction} onPress={onOpenMessages}>
          <Icon name="message" />
          {messagesCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{messagesCount > 99 ? '99+' : messagesCount}</Text>
            </View>
          ) : null}
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={t('home.notifications')} style={styles.topAction} onPress={onOpenNotifications}>
          <Icon name="bell" />
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>
    </View>
  );
}

function ComposerBar({ styles, profile, onOpenCreatePost, onOpenOwnProfile }) {
  const { t } = useI18n();
  return (
    <View style={styles.composer}>
      <Pressable
        style={({ pressed }) => [styles.composerAvatarPressable, pressed && styles.pressed]}
        onPress={onOpenOwnProfile}
      >
        <Avatar name={profile.name} uri={profile.photoUri} size={40} />
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.composerInputPressable, pressed && styles.pressed]}
        onPress={onOpenCreatePost}
      >
        <View style={styles.composerInput}>
          <Text style={styles.composerPlaceholder}>{t('home.composerPlaceholder')}</Text>
        </View>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.composerPhotoPressable, pressed && styles.pressed]}
        onPress={onOpenCreatePost}
        hitSlop={8}
      >
        <Icon name="image" />
      </Pressable>
    </View>
  );
}

function RecentMembers({ styles, userId, blockedUserIds = [], onOpenMember }) {
  const { t } = useI18n();
  const [users, setUsers] = useState([]);
  useEffect(() => {
    let cancelled = false;
    fetchRecentUsers(20).then(result => {
      if (!cancelled) setUsers(result);
    }).catch(() => { if (!cancelled) setUsers([]); });
    return () => { cancelled = true; };
  }, [userId]);
  // Filter at render time so blocking removes a member immediately without refetching.
  const members = users.filter(user => user.uid !== userId && !blockedUserIds.includes(user.uid)).slice(0, 10);
  if (!members.length) return null;
  return <View style={styles.membersSection}>
    <Text style={styles.membersTitle}>{t('home.newMembers')}</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.membersRow}>
      {members.map(user => <Pressable key={user.uid} accessibilityRole="button" accessibilityLabel={user.name} onPress={() => onOpenMember(user.uid)} style={({ pressed }) => [styles.member, pressed && styles.pressed]}>
        <Avatar name={user.name} uri={user.photoUri} size={52} />
        <Text numberOfLines={1} style={styles.memberName}>{(user.name || '?').split(/\s+/)[0]}</Text>
      </Pressable>)}
    </ScrollView>
  </View>;
}

function FeedPost({
  styles,
  post,
  isLiked,
  userId,
  onPress,
  onToggleLike,
  onOpenMenu,
  onOpenAuthor,
  onShare,
  isSaved,
  onToggleSave,
}) {
  const { t } = useI18n();
  const { colors } = useTheme();
  const replyCount = post.replies?.length ?? 0;
  const likes = (post.likes || 0) + (isLiked ? 1 : 0);
  const cleanName = (post.author || '').replace(/\s*\(вы\)\s*$/, '');
  const displayName = isOwnPost(post, userId) ? `${cleanName} (вы)` : cleanName;

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Pressable
          style={({ pressed }) => [styles.postAuthorPressable, pressed && styles.pressed]}
          onPress={() => onOpenAuthor(post)}
        >
          <Avatar name={cleanName} uri={post.authorPhotoUri} size={40} style={{ marginRight: 10 }} />
          <View style={styles.postHeaderInfo}>
            <Text style={styles.postAuthor}>{displayName}</Text>
            <Text style={styles.postMeta}>{post.time}</Text>
          </View>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={t('home.menu')} style={styles.topAction} onPress={() => onOpenMenu(post)}>
          <Icon name="more" />
        </Pressable>
      </View>

      <Pressable onPress={() => onPress(post.id)}>
        <Text style={styles.postContent}>{post.content}</Text>
        {post.imageUri ? (
          <Image source={{ uri: post.imageUri }} style={styles.postImage} resizeMode="cover" />
        ) : null}
      </Pressable>

      <View style={styles.postStats}>
        <Text style={styles.postStatsText}>
          {likes > 0 ? `${likes} ♥` : ''}
          {likes > 0 && replyCount > 0 ? '  ·  ' : ''}
          {replyCount > 0 ? `${replyCount} ···` : ''}
        </Text>
      </View>

      <View style={styles.postActions}>
        <Pressable
          style={({ pressed }) => [styles.postAction, pressed && styles.pressed]}
          onPress={() => onToggleLike(post.id)}
        >
          <Icon name="heart" size={18} color={isLiked ? colors.tabActive : colors.textSecondary} filled={isLiked} /><Text style={styles.postActionText}>{t('home.like')}</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.postAction, pressed && styles.pressed]}
          onPress={() => onPress(post.id)}
        >
          <Icon name="message" size={18} /><Text style={styles.postActionText}>{replyCount}</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.postAction, pressed && styles.pressed]}
          onPress={() => onShare(post)}
        >
          <Icon name="share" size={18} /><Text style={styles.postActionText}>{t('home.share')}</Text>
        </Pressable>
        {!!onToggleSave && (
          <Pressable
            style={({ pressed }) => [styles.postAction, pressed && styles.pressed]}
            onPress={() => onToggleSave(post.id)}
          >
            <Icon name="bookmark" size={18} color={isSaved ? colors.accent : colors.textSecondary} filled={isSaved} />
            <Text style={[styles.postActionText, isSaved && { color: colors.accent }]}>{t('home.save')}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default function HomeScreen({
  profile,
  posts,
  userId,
  onOpenFeed,
  onOpenCreatePost,
  onOpenPostMenu,
  onOpenPost,
  onOpenMember,
  onOpenOwnProfile,
  onOpenSearch,
  onOpenNotifications,
  onOpenMessages,
  onToggleLike,
  likedPostIds = [],
  savedPostIds = [],
  onToggleSavePost,
  connectedIds = [],
  onSendPostToFriend,
  blockedUserIds = [],
  unreadCount,
  messagesCount,
}) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createHomeStyles(colors), [colors]);


  const [sharingPost, setSharingPost] = useState(null);

  const handleSharePost = (post) => {
    setSharingPost(post);
  };

  const closeSharePost = () => {
    setSharingPost(null);
  };

  const handleOpenAuthor = (post) => {
    if (isOwnPost(post, userId)) {
      onOpenOwnProfile?.();
      return;
    }
    if (post.authorId) {
      onOpenMember(post.authorId);
      return;
    }
    const member = getMemberByAuthorName(post.author);
    if (member) onOpenMember(member.id);
  };

  return (
    <View style={styles.screen}>
      <TopHeader
        styles={styles}
        insets={insets}
        onOpenSearch={onOpenSearch}
        onOpenMessages={onOpenMessages}
        onOpenNotifications={onOpenNotifications}
        unreadCount={unreadCount}
        messagesCount={messagesCount}
      />

      <ScrollView
        style={styles.feed}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
      >
        <ComposerBar
          styles={styles}
          profile={profile}
          onOpenCreatePost={onOpenCreatePost}
          onOpenOwnProfile={onOpenOwnProfile}
        />
        <RecentMembers styles={styles} userId={userId} blockedUserIds={blockedUserIds} onOpenMember={onOpenMember} />

        <View style={styles.feedDivider} />

        {posts.map((post) => (
          <FeedPost
            key={post.id}
            styles={styles}
            post={post}
            isLiked={likedPostIds.includes(post.id)}
            isSaved={savedPostIds.includes(post.id)}
            onToggleSave={onToggleSavePost}
            userId={userId}
            onPress={onOpenPost}
            onToggleLike={onToggleLike}
            onOpenMenu={onOpenPostMenu}
            onOpenAuthor={handleOpenAuthor}
            onShare={handleSharePost}
          />
        ))}
      </ScrollView>
      <ShareSheet
        visible={!!sharingPost}
        onClose={closeSharePost}
        post={sharingPost}
        url={sharingPost ? getPostShareUrl(sharingPost.id) : ''}
        connectedIds={connectedIds}
        onSendToFriend={onSendPostToFriend}
      />
    </View>
  );
}

function createHomeStyles(colors) {
  return StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: colors.text,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topAction: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  topActionIcon: {
    fontSize: 20,
    color: colors.text,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.badge,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  feed: {
    flex: 1,
  },
  feedContent: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingBottom: 16,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  composerAvatarPressable: {
    borderRadius: 20,
  },
  composerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composerAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  composerInputPressable: {
    flex: 1,
  },
  composerInput: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  composerPlaceholder: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  composerPhotoPressable: {
    padding: 4,
  },
  composerPhoto: {
    fontSize: 22,
  },
  membersSection: { paddingVertical: 16 },
  membersTitle: { fontSize: 16, fontWeight: '600', color: colors.text, paddingHorizontal: 16, marginBottom: 14 },
  membersRow: { paddingHorizontal: 12, gap: 10 },
  member: { alignItems: 'center', width: 68, gap: 8 },
  memberName: { fontSize: 12, color: colors.text, maxWidth: 68 },
  feedDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginBottom: 4,
  },
  postCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    marginHorizontal: 12,
    marginBottom: 12,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  postAuthorPressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  postAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  postHeaderInfo: {
    flex: 1,
  },
  postAuthor: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  postMeta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 1,
  },
  postMenu: {
    fontSize: 16,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.text,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  postImage: {
    marginHorizontal: 16,
    height: 220,
    borderRadius: 8,
    marginBottom: 10,
  },
  postStats: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  postStatsText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  postActions: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: 4,
  },
  postAction: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    minHeight: 44,
    alignItems: 'center',
    paddingVertical: 10,
  },
  postActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  pressed: {
    opacity: 0.6,
  },
  });
}
