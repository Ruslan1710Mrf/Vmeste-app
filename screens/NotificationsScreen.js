import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NOTIFICATIONS } from '../data/notifications';

function NotificationRow({ item, isRead, onPress }) {
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
        <View style={styles.titleRow}>
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
  const unreadCount = NOTIFICATIONS.filter(
    (n) => n.unread && !readIds.includes(n.id),
  ).length;

  const handlePress = (item) => {
    onMarkRead(item.id);
    if (item.action) onAction(item.action);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}
          onPress={onBack}
        >
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backLabel}>Профиль</Text>
        </Pressable>
        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.screenTitle}>Уведомления</Text>
            <Text style={styles.screenSubtitle}>{unreadCount} непрочитанных</Text>
          </View>
          {unreadCount > 0 && (
            <Pressable
              style={({ pressed }) => [styles.markAllButton, pressed && styles.backPressed]}
              onPress={onMarkAllRead}
            >
              <Text style={styles.markAllText}>Прочитать все</Text>
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleBlock: { flex: 1 },
  markAllButton: { paddingVertical: 6, paddingHorizontal: 4 },
  markAllText: { fontSize: 14, fontWeight: '600', color: '#EA580C' },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  screenSubtitle: { fontSize: 15, color: '#64748B' },
  list: { paddingHorizontal: 24, paddingBottom: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  row: { flexDirection: 'row', padding: 16 },
  rowPressed: { backgroundColor: '#F8FAFC' },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconUnread: { backgroundColor: '#FFF7ED' },
  emoji: { fontSize: 20 },
  content: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  title: { flex: 1, fontSize: 15, fontWeight: '500', color: '#475569' },
  titleUnread: { fontWeight: '600', color: '#1E293B' },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EA580C',
    marginLeft: 8,
  },
  body: { fontSize: 14, color: '#64748B', lineHeight: 20, marginBottom: 6 },
  time: { fontSize: 12, color: '#94A3B8' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 16 },
});
