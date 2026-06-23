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
import { getPostShareUrl } from '../lib/sharePost';
import ShareSheet from '../components/ShareSheet';
import { useTheme } from '../lib/ThemeContext';
import { getFirstName } from '../lib/profileUtils';
import { fetchRecentUsers } from '../lib/userProfileService';

const STORY_COLORS = ['#F58529', '#DD2A7B', '#8134AF', '#405DE6', '#5851DB'];

function TopHeader({ styles, insets, onOpenSearch, onOpenMessages, onOpenNotifications, unreadCount, messagesCount }) {
  return (
    <View style={[styles.topBar, { paddingTop: 8 + (insets?.top ?? 0) }]}>
      <Text style={styles.screenTitle}>Главная</Text>
      <View style={styles.topActions}>
        <Pressable style={styles.topAction} onPress={onOpenSearch}>
          <Text style={styles.topActionIcon}>🔍</Text>
        </Pressable>
        <Pressable style={styles.topAction} onPress={onOpenMessages}>
          <Text style={styles.topActionIcon}>💬</Text>
          {messagesCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{messagesCount}</Text>
            </View>
          ) : null}
        </Pressable>
        <Pressable style={styles.topAction} onPress={onOpenNotifications}>
          <Text style={styles.topActionIcon}>🔔</Text>
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>
    </View>
  );
}

function ComposerBar({ styles, initial, onOpenCreatePost, onOpenOwnProfile }) {
  return (
    <View style={styles.composer}>
      <Pressable
        style={({ pressed }) => [styles.composerAvatarPressable, pressed && styles.pressed]}
        onPress={onOpenOwnProfile}
      >
        <View style={styles.composerAvatar}>
          <Text style={styles.composerAvatarText}>{initial}</Text>
        </View>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.composerInputPressable, pressed && styles.pressed]}
        onPress={onOpenCreatePost}
      >
        <View style={styles.composerInput}>
          <Text style={styles.composerPlaceholder}>Что у вас нового?</Text>
        </View>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.composerPhotoPressable, pressed && styles.pressed]}
        onPress={onOpenCreatePost}
        hitSlop={8}
      >
        <Text style={styles.composerPhoto}>🖼</Text>
      </Pressable>
    </View>
  );
}

function StoryBubble({ styles, name, initial, photoUri, isOwn, ringColor, onPress }) {
  return (
    <Pressable style={({ pressed }) => [styles.storyItem, pressed && styles.pressed]} onPress={onPress}>
      <View style={[styles.storyRing, { borderColor: ringColor }]}>
        <View style={[styles.storyAvatar, isOwn && styles.storyAvatarOwn]}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.storyAvatarImage} />
          ) : (
            <Text style={styles.storyAvatarText}>{initial}</Text>
          )}
          {isOwn ? <View style={styles.storyAdd}><Text style={styles.storyAddText}>＋</Text></View> : null}
        </View>
      </View>
      <Text style={styles.storyName} numberOfLines={1}>{name}</Text>
    </Pressable>
  );
}

function StoriesRow({
  styles,
  profile,
  profileInitial,
  userId,
  onOpenMember,
  onOpenCreatePost,
}) {
  const [storyUsers, setStoryUsers] = useState([]);

  useEffect(() => {
    let cancelled = false;

    fetchRecentUsers(10)
      .then((users) => {
        if (cancelled) return;
        const filtered = userId
          ? users.filter((user) => user.uid !== userId)
          : users;
        setStoryUsers(filtered.slice(0, 10));
      })
      .catch(() => {
        if (!cancelled) setStoryUsers([]);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const stories = [
    {
      id: 'own',
      name: 'История',
      initial: profileInitial,
      photoUri: profile.photoUri ?? null,
      isOwn: true,
    },
    ...storyUsers.map((user, index) => ({
      id: user.uid,
      name: user.name.split(/\s+/)[0],
      initial: user.name.charAt(0).toUpperCase(),
      photoUri: user.photoUri,
      isOwn: false,
      ringColor: STORY_COLORS[index % STORY_COLORS.length],
    })),
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.storiesRow}
    >
      {stories.map((story) => (
        <StoryBubble
          key={story.id}
          styles={styles}
          name={story.name}
          initial={story.initial}
          photoUri={story.photoUri}
          isOwn={story.isOwn}
          ringColor={story.ringColor ?? '#3897F0'}
          onPress={() => {
            if (story.isOwn) {
              onOpenCreatePost?.();
              return;
            }
            onOpenMember(story.id);
          }}
        />
      ))}
    </ScrollView>
  );
}

function FeedPost({
  styles,
  post,
  isLiked,
  onPress,
  onToggleLike,
  onOpenMenu,
  onOpenAuthor,
  onShare,
}) {
  const replyCount = post.replies?.length ?? 0;
  const likes = post.likes + (isLiked ? 1 : 0);

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Pressable
          style={({ pressed }) => [styles.postAuthorPressable, pressed && styles.pressed]}
          onPress={() => onOpenAuthor(post)}
        >
          <View style={styles.postAvatar}>
            <Text style={styles.postAvatarText}>{post.author.charAt(0)}</Text>
          </View>
          <View style={styles.postHeaderInfo}>
            <Text style={styles.postAuthor}>{post.author}</Text>
            <Text style={styles.postMeta}>{post.time} · 🌐</Text>
          </View>
        </Pressable>
        <Pressable hitSlop={8} onPress={() => onOpenMenu(post)}>
          <Text style={styles.postMenu}>•••</Text>
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
          {likes > 0 ? `❤️ ${likes}` : ''}
          {likes > 0 && replyCount > 0 ? '  ·  ' : ''}
          {replyCount > 0 ? `💬 ${replyCount}` : ''}
        </Text>
      </View>

      <View style={styles.postActions}>
        <Pressable
          style={({ pressed }) => [styles.postAction, pressed && styles.pressed]}
          onPress={() => onToggleLike(post.id)}
        >
          <Text style={styles.postActionText}>{isLiked ? '❤️' : '🤍'} Нравится</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.postAction, pressed && styles.pressed]}
          onPress={() => onPress(post.id)}
        >
          <Text style={styles.postActionText}>💬 {replyCount}</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.postAction, pressed && styles.pressed]}
          onPress={() => onShare(post)}
        >
          <Text style={styles.postActionText}>↗ Поделиться</Text>
        </Pressable>
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
  unreadCount,
  messagesCount,
}) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createHomeStyles(colors), [colors]);
  const profileInitial = getFirstName(profile).charAt(0).toUpperCase();

  const [sharingPost, setSharingPost] = useState(null);

  const handleSharePost = (post) => {
    setSharingPost(post);
  };

  const closeSharePost = () => {
    setSharingPost(null);
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
          initial={profileInitial}
          onOpenCreatePost={onOpenCreatePost}
          onOpenOwnProfile={onOpenOwnProfile}
        />
        <StoriesRow
          styles={styles}
          profile={profile}
          profileInitial={profileInitial}
          userId={userId}
          onOpenMember={onOpenMember}
          onOpenCreatePost={onOpenCreatePost}
        />

        <View style={styles.feedDivider} />

        {posts.map((post) => (
          <FeedPost
            key={post.id}
            styles={styles}
            post={post}
            isLiked={likedPostIds.includes(post.id)}
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
    color: '#FFFFFF',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topAction: {
    width: 36,
    height: 36,
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
  storiesRow: {
    paddingHorizontal: 12,
    paddingBottom: 14,
    gap: 14,
  },
  storyItem: {
    alignItems: 'center',
    width: 76,
  },
  storyRing: {
    padding: 2,
    borderRadius: 36,
    borderWidth: 2,
    marginBottom: 6,
  },
  storyAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  storyAvatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  storyAvatarOwn: {
    backgroundColor: colors.surface,
  },
  storyAvatarText: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
  },
  storyAdd: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0095F6',
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyAddText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: -1,
  },
  storyName: {
    fontSize: 11,
    color: colors.text,
    textAlign: 'center',
    maxWidth: 72,
  },
  feedDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginBottom: 4,
  },
  postCard: {
    paddingVertical: 12,
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
