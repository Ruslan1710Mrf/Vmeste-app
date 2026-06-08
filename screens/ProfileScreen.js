import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getProfileInitial } from '../lib/profileUtils';

const MENU_ITEMS = [
  { id: 'edit', label: 'Редактировать профиль', emoji: '✏️' },
  { id: 'feed', label: 'Лента сообщества', emoji: '📝' },
  { id: 'connections', label: 'Мои связи', emoji: '🤝' },
  { id: 'messages', label: 'Сообщения', emoji: '💬' },
  { id: 'events', label: 'Мои события', emoji: '📅' },
  { id: 'checklist', label: 'Чек-лист адаптации', emoji: '✅' },
  { id: 'saved', label: 'Сохранённое', emoji: '🔖' },
  { id: 'notifications', label: 'Уведомления', emoji: '🔔' },
  { id: 'help', label: 'Помощь и поддержка', emoji: '❓' },
  { id: 'settings', label: 'Настройки', emoji: '⚙️' },
];

function getMenuLabel(item, counts) {
  const {
    savedCount,
    unreadCount,
    messagesCount,
    registeredEventsCount,
    connectionsCount,
    checklistDone,
    checklistTotal,
  } = counts;
  if (item.id === 'saved' && savedCount > 0) return `${item.label} (${savedCount})`;
  if (item.id === 'notifications' && unreadCount > 0) return `${item.label} (${unreadCount})`;
  if (item.id === 'messages' && messagesCount > 0) return `${item.label} (${messagesCount})`;
  if (item.id === 'events' && registeredEventsCount > 0) return `${item.label} (${registeredEventsCount})`;
  if (item.id === 'connections' && connectionsCount > 0) return `${item.label} (${connectionsCount})`;
  if (item.id === 'checklist' && checklistDone > 0) {
    return `${item.label} (${checklistDone}/${checklistTotal})`;
  }
  return item.label;
}

function StatBox({ stat }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statLabel}>{stat.label}</Text>
    </View>
  );
}

function MenuRow({ item, counts, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.menuRow, pressed && styles.rowPressed]}
      onPress={() => onPress(item.id)}
    >
      <Text style={styles.menuEmoji}>{item.emoji}</Text>
      <Text style={styles.menuLabel}>{getMenuLabel(item, counts)}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </Pressable>
  );
}

export default function ProfileScreen({
  profile,
  onMenuPress,
  savedCount,
  unreadCount,
  connectionsCount,
  postsCount,
  eventsCount,
  messagesCount,
  registeredEventsCount,
  checklistDone,
  checklistTotal,
}) {
  const initial = getProfileInitial(profile);
  const menuCounts = {
    savedCount,
    unreadCount,
    messagesCount,
    registeredEventsCount,
    connectionsCount,
    checklistDone,
    checklistTotal,
  };
  const stats = [
    { label: 'Связи', value: String(connectionsCount) },
    { label: 'События', value: String(eventsCount) },
    { label: 'Посты', value: String(postsCount) },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.name}>{profile.name}</Text>
          {profile.email ? (
            <Text style={styles.email}>{profile.email}</Text>
          ) : null}
          <Text style={styles.location}>🇺🇸 {profile.city}</Text>
          <Text style={styles.memberSince}>В сообществе с {profile.memberSince}</Text>
          <Text style={styles.bio}>{profile.bio}</Text>
          <View style={styles.interests}>
            {profile.interests.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <StatBox key={stat.label} stat={stat} />
          ))}
        </View>

        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, index) => (
            <View key={item.id}>
              <MenuRow item={item} counts={menuCounts} onPress={onMenuPress} />
              {index < MENU_ITEMS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarLarge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: { fontSize: 36, fontWeight: '700', color: '#EA580C' },
  name: { fontSize: 24, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  email: { fontSize: 14, color: '#64748B', marginBottom: 4 },
  location: { fontSize: 15, color: '#64748B', marginBottom: 4 },
  memberSince: { fontSize: 13, color: '#94A3B8', marginBottom: 16 },
  bio: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 16,
  },
  interests: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  tag: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: { fontSize: 13, fontWeight: '500', color: '#EA580C' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: { fontSize: 22, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  statLabel: { fontSize: 13, color: '#94A3B8' },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  rowPressed: { backgroundColor: '#F8FAFC' },
  menuEmoji: { fontSize: 20, marginRight: 14 },
  menuLabel: { flex: 1, fontSize: 16, color: '#1E293B' },
  menuArrow: { fontSize: 22, color: '#CBD5E1' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 18 },
});
