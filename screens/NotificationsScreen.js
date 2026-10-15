import { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NOTIFICATIONS } from '../data/notifications';
import { useI18n } from '../lib/i18n';
import { useTheme } from '../lib/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function NotificationRow({ item, isRead, onPress }) {
  const styles = useStyles();
  const unread = item.unread && !isRead;
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={() => onPress(item)}
    >
      <View style={[styles.icon, unread && styles.iconUnread]}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.rowTitleLine}>
          <Text style={[styles.title, unread && styles.titleUnread]}>{item.title}</Text>
          {unread && <View style={styles.dot} />}
        </View>
        <Text style={styles.body}>{item.body}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </Pressable>
  );
}

export default function NotificationsScreen({ onBack, onAction, readIds, onMarkRead, onMarkAllRead }) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const unreadCount = NOTIFICATIONS.filter(
    (n) => n.unread && !readIds.includes(n.id),
  ).length;

  const handlePress = (item) => {
    onMarkRead(item.id);
    if (item.action) onAction(item.action);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: 16 + insets.top }]}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}
          onPress={onBack}
        >
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backLabel}>{t('notifications.backLabel')}</Text>
        </Pressable>
        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.screenTitle}>{t('notifications.title')}</Text>
            <Text style={styles.screenSubtitle}>{t('notifications.unreadCount', { value: unreadCount })}</Text>
          </View>
          {unreadCount > 0 && (
            <Pressable
              style={({ pressed }) => [styles.markAllButton, pressed && styles.backPressed]}
              onPress={onMarkAllRead}
            >
              <Text style={styles.markAllText}>{t('notifications.markAllRead')}</Text>
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {NOTIFICATIONS.length === 0 && (
          <Text style={styles.emptyText}>{t('notifications.empty')}</Text>
        )}
        {NOTIFICATIONS.length > 0 && (
          <View style={styles.card}>
            {NOTIFICATIONS.map((item, index) => (
              <View key={item.id}>
                <NotificationRow
                  item={item}
                  isRead={readIds.includes(item.id)}
                  onPress={handlePress}
                />
                {index < NOTIFICATIONS.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
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
    emptyText: { textAlign: 'center', color: colors.textSecondary, fontSize: 15, marginTop: 48 },
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
    titleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
    },
    titleBlock: { flex: 1 },
    markAllButton: { paddingVertical: 6, paddingHorizontal: 4 },
    markAllText: { fontSize: 14, fontWeight: '600', color: colors.accent },
    screenTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.5,
      marginBottom: 6,
    },
    screenSubtitle: { fontSize: 15, color: colors.textSecondary },
    list: { paddingHorizontal: 24, paddingBottom: 16 },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    row: { flexDirection: 'row', padding: 16 },
    rowPressed: { backgroundColor: colors.pressed },
    icon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.surfaceSecondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    iconUnread: { backgroundColor: colors.accentSoft },
    emoji: { fontSize: 20 },
    content: { flex: 1 },
    rowTitleLine: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    title: { flex: 1, fontSize: 15, fontWeight: '500', color: colors.textSecondary },
    titleUnread: { fontWeight: '600', color: colors.text },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.accent,
      marginLeft: 8,
    },
    body: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 6 },
    time: { fontSize: 12, color: colors.textMuted },
    divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 16 },
  });
}
