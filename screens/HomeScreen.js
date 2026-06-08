import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { EVENTS, getEventById } from '../data/events';
import { JOBS } from '../data/jobs';
import { getFirstName } from '../lib/profileUtils';

const MENU_ITEMS = [
  { id: 'work', label: 'Работа', emoji: '💼', color: '#2563EB' },
  { id: 'immigration', label: 'Иммиграция', emoji: '🌍', color: '#059669' },
  { id: 'networking', label: 'Нетворкинг', emoji: '🤝', color: '#7C3AED' },
  { id: 'profile', label: 'Профиль', emoji: '👤', color: '#EA580C' },
];

const featuredEvent = EVENTS[0];
const featuredJob = JOBS[0];
const previewPosts = (posts) => posts.slice(0, 2);

function getPersonalTip(profile) {
  if (!profile.city?.trim()) {
    return {
      emoji: '📍',
      title: 'Укажите ваш город',
      body: 'Так мы покажем события, вакансии и советы рядом с вами.',
      action: 'setup',
    };
  }
  if (profile.interests?.includes('IT')) {
    return {
      emoji: '💻',
      title: 'IT-митап в Сан-Франциско',
      body: '22 июня — карьера в Big Tech. Нажмите, чтобы записаться.',
      action: 'event',
      eventId: '2',
    };
  }
  if (profile.city?.includes('Нью-Йорк')) {
    return {
      emoji: '🗽',
      title: 'Русскоязычное NYC-сообщество',
      body: '12 400 участников в Telegram — работа, жильё, адаптация.',
      action: 'networking',
    };
  }
  return {
    emoji: '✅',
    title: 'Чек-лист адаптации',
    body: '10 шагов для комфортного старта в США — SSN, банк, страховка.',
    action: 'checklist',
  };
}

function QuickAction({ emoji, label, badge, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.quickAction, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <Text style={styles.quickEmoji}>{emoji}</Text>
      <Text style={styles.quickLabel}>{label}</Text>
      {badge ? (
        <View style={styles.quickBadge}>
          <Text style={styles.quickBadgeText}>{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function PostPreview({ post, onPress }) {
  return (
    <Pressable onPress={() => onPress(post.id)} style={styles.postPreviewPress}>
      <Text style={styles.postAuthor}>{post.author} · {post.time}</Text>
      <Text style={styles.postContent} numberOfLines={2}>{post.content}</Text>
    </Pressable>
  );
}

export default function HomeScreen({
  profile,
  posts,
  onNavigate,
  onOpenJob,
  onOpenEvent,
  onOpenFeed,
  onOpenPost,
  onOpenSearch,
  onOpenChecklist,
  onOpenProfileSetup,
  onOpenNotifications,
  onOpenMessages,
  onOpenEvents,
  onOpenSaved,
  unreadCount,
  messagesCount,
  checklistDone,
  checklistTotal,
  registeredEventIds,
  savedJobsCount,
}) {
  const firstName = getFirstName(profile);
  const tip = getPersonalTip(profile);
  const nextEvent = registeredEventIds.map(getEventById).find(Boolean);
  const stats = [
    { value: `${JOBS.length}`, label: 'Вакансий' },
    { value: `${EVENTS.length}`, label: 'Событий' },
    { value: `${posts.length}`, label: 'Постов' },
  ];

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.brand}>Vmeste</Text>
        <Text style={styles.tagline}>
          Сообщество для соотечественников по всему миру
        </Text>
      </View>

      <View style={styles.welcomeBlock}>
        <Text style={styles.welcomeTitle}>Привет, {firstName}! 👋</Text>
        <Text style={styles.welcomeSubtitle}>
          Всё необходимое для жизни и работы в США
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.searchBar, pressed && styles.cardPressed]}
        onPress={onOpenSearch}
      >
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchPlaceholder}>Поиск вакансий, событий, людей...</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.tipCard, pressed && styles.cardPressed]}
        onPress={() => {
          if (tip.action === 'setup') onOpenProfileSetup();
          else if (tip.action === 'checklist') onOpenChecklist();
          else if (tip.action === 'event') onOpenEvent(tip.eventId);
          else onNavigate(tip.action);
        }}
      >
        <Text style={styles.tipEmoji}>{tip.emoji}</Text>
        <View style={styles.tipContent}>
          <Text style={styles.tipLabel}>Рекомендуем</Text>
          <Text style={styles.tipTitle}>{tip.title}</Text>
          <Text style={styles.tipBody}>{tip.body}</Text>
        </View>
      </Pressable>

      <Text style={styles.sectionTitle}>Ваш день</Text>
      <View style={styles.quickRow}>
        <QuickAction
          emoji="🔔"
          label="Уведомления"
          badge={unreadCount > 0 ? unreadCount : null}
          onPress={onOpenNotifications}
        />
        <QuickAction
          emoji="💬"
          label="Сообщения"
          badge={messagesCount > 0 ? messagesCount : null}
          onPress={onOpenMessages}
        />
        <QuickAction
          emoji="✅"
          label="Чек-лист"
          badge={checklistDone > 0 ? `${checklistDone}/${checklistTotal}` : null}
          onPress={onOpenChecklist}
        />
        <QuickAction
          emoji="🔖"
          label="Сохранённое"
          badge={savedJobsCount > 0 ? savedJobsCount : null}
          onPress={onOpenSaved}
        />
      </View>

      {nextEvent ? (
        <>
          <Text style={styles.sectionTitle}>Ваше событие</Text>
          <Pressable
            style={({ pressed }) => [styles.featuredCard, pressed && styles.cardPressed]}
            onPress={() => onOpenEvent(nextEvent.id)}
          >
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>{nextEvent.date}</Text>
            </View>
            <Text style={styles.featuredTitle}>{nextEvent.title}</Text>
            <Text style={styles.featuredMeta}>📍 {nextEvent.city}</Text>
          </Pressable>
        </>
      ) : null}

      <View style={styles.statsRow}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statBox}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Лента сообщества</Text>
        <Pressable onPress={onOpenFeed}>
          <Text style={styles.seeAll}>Вся лента →</Text>
        </Pressable>
      </View>
      <Pressable
        style={({ pressed }) => [styles.feedCard, pressed && styles.cardPressed]}
        onPress={onOpenFeed}
      >
        {previewPosts(posts).map((post, index) => (
          <View key={post.id}>
            <PostPreview post={post} onPress={onOpenPost} />
            {index < previewPosts(posts).length - 1 && <View style={styles.postDivider} />}
          </View>
        ))}
      </Pressable>

      <Text style={styles.sectionTitle}>Ближайшее событие</Text>
      <Pressable
        style={({ pressed }) => [styles.featuredCard, pressed && styles.cardPressed]}
        onPress={() => onOpenEvent(featuredEvent.id)}
      >
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredBadgeText}>{featuredEvent.date}</Text>
        </View>
        <Text style={styles.featuredTitle}>{featuredEvent.title}</Text>
        <Text style={styles.featuredMeta}>📍 {featuredEvent.city}</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Новая вакансия</Text>
      <Pressable
        style={({ pressed }) => [styles.featuredCard, pressed && styles.cardPressed]}
        onPress={() => onOpenJob(featuredJob.id)}
      >
        <Text style={styles.featuredTitle}>{featuredJob.title}</Text>
        <Text style={styles.featuredCompany}>{featuredJob.company}</Text>
        <Text style={styles.featuredSalary}>{featuredJob.salary}</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Разделы</Text>
      <View style={styles.grid}>
        {MENU_ITEMS.map((item) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
            onPress={() => onNavigate(item.id)}
          >
            <View style={[styles.iconCircle, { backgroundColor: `${item.color}18` }]}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
            <Text style={styles.cardLabel}>{item.label}</Text>
            <View style={[styles.accentBar, { backgroundColor: item.color }]} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  header: { marginBottom: 24 },
  brand: {
    fontSize: 36,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  tagline: { marginTop: 8, fontSize: 15, lineHeight: 22, color: '#64748B' },
  welcomeBlock: { marginBottom: 20 },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
  },
  welcomeSubtitle: { fontSize: 15, color: '#94A3B8' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  searchIcon: { fontSize: 18, marginRight: 10 },
  searchPlaceholder: { fontSize: 15, color: '#94A3B8' },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  tipEmoji: { fontSize: 32, marginRight: 14 },
  tipContent: { flex: 1 },
  tipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  tipTitle: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  tipBody: { fontSize: 14, lineHeight: 20, color: '#64748B' },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  quickAction: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
  },
  quickEmoji: { fontSize: 22, marginBottom: 6 },
  quickLabel: { fontSize: 13, fontWeight: '600', color: '#475569' },
  quickBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBadgeText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  statLabel: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 10,
  },
  seeAll: { fontSize: 14, fontWeight: '500', color: '#2563EB', marginBottom: 10 },
  feedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  postPreviewPress: { paddingVertical: 4 },
  postAuthor: { fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 4 },
  postContent: { fontSize: 14, lineHeight: 20, color: '#475569' },
  postDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  featuredCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  featuredBadgeText: { fontSize: 13, fontWeight: '600', color: '#7C3AED' },
  featuredTitle: { fontSize: 17, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  featuredCompany: { fontSize: 15, color: '#64748B', marginBottom: 8 },
  featuredMeta: { fontSize: 14, color: '#64748B' },
  featuredSalary: { fontSize: 14, fontWeight: '600', color: '#059669' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  card: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    paddingBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  cardPressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emoji: { fontSize: 24 },
  cardLabel: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  accentBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
});
