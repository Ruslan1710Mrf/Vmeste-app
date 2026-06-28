import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MemberOptionsMenu from '../components/MemberOptionsMenu';
import { useI18n } from '../lib/i18n';

function MemberPostRow({ post, onPress }) {
  const replyCount = post.replies?.length ?? 0;

  return (
    <Pressable
      style={({ pressed }) => [styles.postCard, pressed && styles.buttonPressed]}
      onPress={() => onPress(post.id)}
    >
      <View style={styles.postHeader}>
        <Text style={styles.postCategory}>{post.category}</Text>
        <Text style={styles.postTime}>{post.time}</Text>
      </View>
      <Text style={styles.postContent} numberOfLines={3}>
        {post.content}
      </Text>
      <Text style={styles.postMeta}>
        ❤️ {post.likes} · 💬 {replyCount}
      </Text>
    </Pressable>
  );
}

function MutualConnectionRow({ member, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.mutualRow, pressed && styles.buttonPressed]}
      onPress={() => onPress(member.id)}
    >
      <View style={styles.mutualAvatar}>
        <Text style={styles.mutualAvatarText}>{member.name.charAt(0)}</Text>
      </View>
      <View style={styles.mutualInfo}>
        <Text style={styles.mutualName}>{member.name}</Text>
        <Text style={styles.mutualRole}>{member.role}</Text>
      </View>
      <Text style={styles.mutualArrow}>›</Text>
    </Pressable>
  );
}

export default function MemberDetailScreen({
  member,
  memberPosts = [],
  mutualConnections = [],
  onBack,
  isConnected,
  onConnect,
  onMessage,
  onOpenPost,
  onOpenMember,
  isBlocked,
  onBlock,
  onUnblock,
  onReport,
}) {
  const { t } = useI18n();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}
          onPress={onBack}
        >
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backLabel}>{t('memberDetail.back')}</Text>
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

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{member.name.charAt(0)}</Text>
          </View>
          <Text style={styles.name}>{member.name}</Text>
          <Text style={styles.role}>{member.role}</Text>
          <Text style={styles.city}>{member.country} {member.city}</Text>
        </View>

        <Text style={styles.sectionTitle}>{t('memberDetail.about')}</Text>
        <Text style={styles.bio}>{member.bio}</Text>

        <Text style={styles.sectionTitle}>{t('memberDetail.interests')}</Text>
        <View style={styles.tags}>
          {member.interests.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {isBlocked ? (
          <View style={styles.actions}>
            <View style={styles.blockedBanner}>
              <Text style={styles.blockedText}>{t('memberDetail.userBlocked')}</Text>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.messageButton,
                styles.messageButtonOutline,
                pressed && styles.buttonPressed,
              ]}
              onPress={onUnblock}
            >
              <Text style={styles.messageTextOutline}>{t('memberDetail.unblock')}</Text>
            </Pressable>
          </View>
        ) : isConnected ? (
          <View style={styles.actions}>
            <View style={styles.successBanner}>
              <Text style={styles.successText}>✓ {t('memberDetail.inYourConnections')}</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.messageButton, pressed && styles.buttonPressed]}
              onPress={() => onMessage(member.id)}
            >
              <Text style={styles.messageText}>{t('memberDetail.sendMessage')}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.actionRow}>
            <Pressable
              style={({ pressed }) => [
                styles.connectButton,
                styles.actionButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => onConnect(member.id)}
            >
              <Text style={styles.connectText}>{t('memberDetail.addToConnections')}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.messageButton,
                styles.actionButton,
                styles.messageButtonOutline,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => onMessage(member.id)}
            >
              <Text style={styles.messageTextOutline}>{t('memberDetail.sendMessage')}</Text>
            </Pressable>
          </View>
        )}

        {mutualConnections.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('memberDetail.mutualConnections', { value: mutualConnections.length })}
            </Text>
            <View style={styles.mutualCard}>
              {mutualConnections.map((connection, index) => (
                <View key={connection.id}>
                  <MutualConnectionRow
                    member={connection}
                    onPress={onOpenMember}
                  />
                  {index < mutualConnections.length - 1 ? (
                    <View style={styles.divider} />
                  ) : null}
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('memberDetail.posts')} {memberPosts.length > 0 ? `(${memberPosts.length})` : ''}
          </Text>
          {memberPosts.length === 0 ? (
            <View style={styles.emptyPosts}>
              <Text style={styles.emptyPostsText}>{t('memberDetail.noPosts')}</Text>
            </View>
          ) : (
            <View style={styles.postsList}>
              {memberPosts.map((post) => (
                <MemberPostRow key={post.id} post={post} onPress={onOpenPost} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
  },
  menuDots: {
    fontSize: 18,
    color: '#64748B',
    letterSpacing: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingRight: 12,
  },
  backPressed: { opacity: 0.6 },
  backIcon: { fontSize: 20, color: '#7C3AED', marginRight: 4 },
  backLabel: { fontSize: 16, fontWeight: '500', color: '#7C3AED' },
  content: { paddingHorizontal: 24, paddingBottom: 32 },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#7C3AED' },
  name: { fontSize: 24, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  role: { fontSize: 15, color: '#64748B', marginBottom: 4 },
  city: { fontSize: 14, color: '#94A3B8' },
  section: { marginTop: 28 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 10,
  },
  bio: {
    fontSize: 15,
    lineHeight: 24,
    color: '#475569',
    marginBottom: 24,
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  tag: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: { fontSize: 13, fontWeight: '500', color: '#7C3AED' },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
  },
  connectButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonPressed: { opacity: 0.9 },
  connectText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  messageButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  messageButtonOutline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#7C3AED',
  },
  messageText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  messageTextOutline: { fontSize: 15, fontWeight: '600', color: '#7C3AED' },
  successBanner: {
    backgroundColor: '#F3E8FF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  successText: { fontSize: 16, fontWeight: '600', color: '#7C3AED' },
  blockedBanner: {
    backgroundColor: '#FEE2E2',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  blockedText: { fontSize: 16, fontWeight: '600', color: '#EF4444' },
  actions: { gap: 12, marginBottom: 8 },
  mutualCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mutualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  mutualAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  mutualAvatarText: { fontSize: 16, fontWeight: '600', color: '#7C3AED' },
  mutualInfo: { flex: 1 },
  mutualName: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  mutualRole: { fontSize: 13, color: '#64748B', marginTop: 2 },
  mutualArrow: { fontSize: 20, color: '#94A3B8' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 14 },
  postsList: { gap: 12 },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  postCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C3AED',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  postTime: { fontSize: 13, color: '#94A3B8' },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1E293B',
    marginBottom: 8,
  },
  postMeta: { fontSize: 13, color: '#64748B' },
  emptyPosts: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  emptyPostsText: { fontSize: 15, color: '#94A3B8' },
});
