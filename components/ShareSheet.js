import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../lib/ThemeContext';
import ShareButtons from './ShareButtons';
import CapturablePostCard from './CapturablePostCard';
import { fetchUsersByIds } from '../lib/userProfileService';
import { useI18n } from '../lib/i18n';

export default function ShareSheet({ visible, onClose, post, url, connectedIds = [], onSendToFriend }) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const viewShotRef = useRef(null);
  const [imageUri, setImageUri] = useState(null);
  const [friends, setFriends] = useState([]);
  const [sentIds, setSentIds] = useState([]);
  const [sendingId, setSendingId] = useState(null);

  // Друзья для «Отправить другу». Грузим при открытии.
  useEffect(() => {
    if (!visible || !onSendToFriend || connectedIds.length === 0) {
      setFriends([]);
      setSentIds([]);
      return;
    }
    let cancelled = false;
    fetchUsersByIds(connectedIds)
      .then((list) => { if (!cancelled) setFriends(list); })
      .catch(() => { if (!cancelled) setFriends([]); });
    return () => { cancelled = true; };
  }, [visible, onSendToFriend, connectedIds]);

  const handleSendToFriend = async (friend) => {
    if (!post || sendingId || sentIds.includes(friend.id)) return;
    setSendingId(friend.id);
    const ok = await onSendToFriend(post, friend);
    setSendingId(null);
    if (ok) setSentIds((prev) => [...prev, friend.id]);
  };

  useEffect(() => {
    if (!visible || !post) {
      setImageUri(null);
      return;
    }

    // Небольшая задержка, чтобы скрытая карточка успела отрендериться перед снимком
    const timer = setTimeout(async () => {
      try {
        if (viewShotRef.current) {
          const uri = await viewShotRef.current.capture();
          setImageUri(uri);
        }
      } catch (error) {
        // Снимок не удался — например, в десктопном браузере react-native-view-shot
        // полагается на navigator.share, которого там может не быть.
        // На реальном телефоне (Expo Go / собранное приложение) это работает нормально.
        setImageUri(null);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [visible, post]);

  if (!post) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{t('shareSheet.title')}</Text>

          {onSendToFriend && friends.length > 0 && (
            <View style={styles.friendsBlock}>
              <Text style={styles.sectionLabel}>{t('shareSheet.sendToFriend')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.friendsRow}>
                {friends.map((friend) => {
                  const sent = sentIds.includes(friend.id);
                  return (
                    <Pressable
                      key={friend.id}
                      style={({ pressed }) => [styles.friend, pressed && { opacity: 0.6 }]}
                      onPress={() => handleSendToFriend(friend)}
                      disabled={sent || sendingId === friend.id}
                    >
                      <View style={[styles.friendAvatar, sent && styles.friendAvatarSent]}>
                        <Text style={[styles.friendAvatarText, sent && { color: '#FFFFFF' }]}>{sent ? '✓' : (friend.name || '?').charAt(0)}</Text>
                      </View>
                      <Text style={styles.friendName} numberOfLines={1}>
                        {sent ? t('shareSheet.sent') : (friend.name || '').split(' ')[0]}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          <ShareButtons
            text={[post.author, post.category].filter(Boolean).join(' · ') + '\n\n' + (post.content || '')}
            url={url}
            imageUri={imageUri}
            style={styles.buttonsRow}
          />

          <Pressable
            style={({ pressed }) => [styles.cancelButton, pressed && styles.cancelPressed]}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>{t('shareSheet.cancel')}</Text>
          </Pressable>
        </Pressable>
      </Pressable>

      {/* Скрытая карточка вне экрана — нужна только для снимка под Instagram/TikTok */}
      <View style={styles.hiddenCapture} pointerEvents="none">
        <CapturablePostCard ref={viewShotRef} post={post} />
      </View>
    </Modal>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    sheet: {
      width: '100%', maxWidth: 560, alignSelf: 'center',
      backgroundColor: colors.surface,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 28,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    buttonsRow: {
      justifyContent: 'center',
      marginBottom: 16,
    },
    friendsBlock: { marginBottom: 16 },
    sectionLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '600', marginBottom: 10 },
    friendsRow: { gap: 14, paddingRight: 8 },
    friend: { alignItems: 'center', width: 60 },
    friendAvatar: {
      width: 48, height: 48, borderRadius: 24,
      backgroundColor: colors.accentSoft,
      alignItems: 'center', justifyContent: 'center',
    },
    friendAvatarSent: { backgroundColor: colors.accent },
    friendAvatarText: { fontSize: 18, fontWeight: '700', color: colors.accent },
    friendName: { fontSize: 11, color: colors.textSecondary, marginTop: 4, maxWidth: 56, textAlign: 'center' },
    cancelButton: {
      paddingVertical: 14,
      alignItems: 'center',
      borderRadius: 10,
      backgroundColor: colors.pressed,
    },
    cancelPressed: {
      opacity: 0.7,
    },
    cancelText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    hiddenCapture: {
      position: 'absolute',
      top: -9999,
      left: -9999,
      opacity: 0,
    },
  });
}
