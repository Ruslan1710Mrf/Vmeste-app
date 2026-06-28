import { useMemo } from 'react';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '../lib/ThemeContext';
import { useI18n } from '../lib/i18n';
import { THEME_OPTIONS } from '../lib/theme';
import { IMMIGRATION_STATUS_UNKNOWN } from '../data/profileFields';
import { getProfileInitial } from '../lib/profileUtils';

const MENU_ITEMS = [
  { id: 'edit', labelKey: 'profile.menu.edit', emoji: '✏️' },
  { id: 'feed', labelKey: 'profile.menu.feed', emoji: '📝' },
  { id: 'connections', labelKey: 'profile.menu.connections', emoji: '🤝' },
  { id: 'messages', labelKey: 'profile.menu.messages', emoji: '💬' },
  { id: 'events', labelKey: 'profile.menu.events', emoji: '📅' },
  { id: 'checklist', labelKey: 'profile.menu.checklist', emoji: '✅' },
  { id: 'saved', labelKey: 'profile.menu.saved', emoji: '🔖' },
  { id: 'notifications', labelKey: 'profile.menu.notifications', emoji: '🔔' },
  { id: 'help', labelKey: 'profile.menu.help', emoji: '❓' },
  { id: 'settings', labelKey: 'profile.menu.settings', emoji: '⚙️' },
];

function getMenuLabel(item, counts, t) {
  const {
    savedCount,
    unreadCount,
    messagesCount,
    registeredEventsCount,
    connectionsCount,
    checklistDone,
    checklistTotal,
  } = counts;
  const label = t(item.labelKey);
  if (item.id === 'saved' && savedCount > 0) return `${label} (${savedCount})`;
  if (item.id === 'notifications' && unreadCount > 0) return `${label} (${unreadCount})`;
  if (item.id === 'messages' && messagesCount > 0) return `${label} (${messagesCount})`;
  if (item.id === 'events' && registeredEventsCount > 0) return `${label} (${registeredEventsCount})`;
  if (item.id === 'connections' && connectionsCount > 0) return `${label} (${connectionsCount})`;
  if (item.id === 'checklist' && checklistDone > 0) {
    return `${label} (${checklistDone}/${checklistTotal})`;
  }
  return label;
}

const COVER_HEIGHT = 160;
const AVATAR_SIZE = 90;
const AVATAR_OVERLAP = AVATAR_SIZE / 2;

function ProfileCover({ coverPhoto, styles }) {
  if (coverPhoto) {
    return <Image source={{ uri: coverPhoto }} style={styles.coverImage} />;
  }

  return (
    <View style={styles.coverGradient}>
      <Svg
        width="100%"
        height={COVER_HEIGHT}
        viewBox={`0 0 100 ${COVER_HEIGHT}`}
        preserveAspectRatio="none"
      >
        <Defs>
          <LinearGradient id="profileCoverGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#EA580C" />
            <Stop offset="100%" stopColor="#1E293B" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height={COVER_HEIGHT} fill="url(#profileCoverGradient)" />
      </Svg>
    </View>
  );
}

function ThemePicker({ styles, preference, onSelect, t }) {
  return (
    <View style={styles.themeCard}>
      <Text style={styles.themeTitle}>{t('theme.title')}</Text>
      <View style={styles.themeRow}>
        {THEME_OPTIONS.map((option) => {
          const selected = preference === option.id;
          return (
            <Pressable
              key={option.id}
              style={({ pressed }) => [
                styles.themeOption,
                selected && styles.themeOptionSelected,
                pressed && styles.rowPressed,
              ]}
              onPress={() => onSelect(option.id)}
            >
              <Text style={styles.themeEmoji}>{option.emoji}</Text>
              <Text style={[styles.themeLabel, selected && styles.themeLabelSelected]}>
                {t(`theme.${option.id}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function StatBox({ styles, stat, onPress }) {
  const content = (
    <>
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statLabel}>{stat.label}</Text>
    </>
  );

  if (!stat.action || !onPress) {
    return <View style={styles.statBox}>{content}</View>;
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.statBox, pressed && styles.rowPressed]}
      onPress={() => onPress(stat.action)}
    >
      {content}
    </Pressable>
  );
}

function MenuRow({ styles, item, counts, onPress, t }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.menuRow, pressed && styles.rowPressed]}
      onPress={() => onPress(item.id)}
    >
      <Text style={styles.menuEmoji}>{item.emoji}</Text>
      <Text style={styles.menuLabel}>{getMenuLabel(item, counts, t)}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </Pressable>
  );
}

export default function ProfileScreen({
  profile,
  onMenuPress,
  onStatPress,
  onOpenTagFeed,
  onBack,
  backLabel,
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
  const { colors, preference, setThemePreference } = useTheme();
  const { t } = useI18n();
  const styles = useMemo(() => createProfileStyles(colors), [colors]);
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
    { label: t('profile.connections'), value: String(connectionsCount), action: 'connections' },
    { label: t('profile.events'), value: String(eventsCount), action: 'events' },
    { label: t('profile.posts'), value: String(postsCount), action: 'myPosts' },
  ];

  const statsLine = `${connectionsCount} — ${t('profile.connections').toLowerCase()} · ${postsCount} — ${t('profile.posts').toLowerCase()} · ${eventsCount} — ${t('profile.events').toLowerCase()}`;

  return (
    <View style={styles.container}>
      {onBack ? (
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.rowPressed]}
            onPress={onBack}
          >
            <Text style={styles.backIcon}>←</Text>
            <Text style={styles.backLabel}>{backLabel ?? t('profile.backLabel')}</Text>
          </Pressable>
        </View>
      ) : null}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.coverSection}>
            <View style={styles.coverImageArea}>
              <ProfileCover coverPhoto={profile.coverPhoto} styles={styles} />
            </View>
            <View style={styles.avatarRow}>
              {profile.photoUri ? (
                <Image source={{ uri: profile.photoUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarLarge}>
                  <Text style={styles.avatarText}>{initial}</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.profileBody}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.statsLine}>{statsLine}</Text>
            <Text style={styles.location}>📍 {profile.city}</Text>
            {profile.profession ? (
              <Text style={styles.profession}>{profile.profession}</Text>
            ) : null}
            <View style={styles.infoSection}>
              <View style={styles.infoHeader}>
                <Text style={styles.infoTitle}>{t('profile.personalInfo')}</Text>
                <Pressable
                  style={({ pressed }) => [styles.infoEditButton, pressed && styles.rowPressed]}
                  onPress={() => onMenuPress('edit')}
                >
                  <Text style={styles.infoEditText}>✏️</Text>
                </Pressable>
              </View>
              {profile.email ? (
                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>✉️</Text>
                  <Text style={styles.infoText}>{profile.email}</Text>
                </View>
              ) : null}
              {profile.originCountry ? (
                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>🌍</Text>
                  <Text style={styles.infoText}>{t('profile.from', { value: profile.originCountry })}</Text>
                </View>
              ) : null}
              {profile.immigrationStatus
              && profile.immigrationStatus !== IMMIGRATION_STATUS_UNKNOWN ? (
                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>📋</Text>
                  <Text style={styles.infoText}>{t('profile.status', { value: profile.immigrationStatus })}</Text>
                </View>
              ) : null}
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📅</Text>
                <Text style={styles.infoText}>{t('profile.memberSince', { value: profile.memberSince })}</Text>
              </View>
            </View>
            {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
            {profile.linkedInUrl || profile.telegramUrl ? (
              <View style={styles.linksRow}>
                {profile.linkedInUrl ? (
                  <Pressable
                    style={({ pressed }) => [styles.linkButton, pressed && styles.rowPressed]}
                    onPress={() => Linking.openURL(
                      profile.linkedInUrl.startsWith('http')
                        ? profile.linkedInUrl
                        : `https://${profile.linkedInUrl}`,
                    )}
                  >
                    <Text style={styles.linkText}>LinkedIn</Text>
                  </Pressable>
                ) : null}
                {profile.telegramUrl ? (
                  <Pressable
                    style={({ pressed }) => [styles.linkButton, pressed && styles.rowPressed]}
                    onPress={() => {
                      const url = profile.telegramUrl.startsWith('http')
                        ? profile.telegramUrl
                        : profile.telegramUrl.startsWith('@')
                          ? `https://t.me/${profile.telegramUrl.slice(1)}`
                          : `https://t.me/${profile.telegramUrl}`;
                      Linking.openURL(url);
                    }}
                  >
                    <Text style={styles.linkText}>Telegram</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
            {profile.interests.length > 0 ? (
              <View style={styles.interests}>
                {profile.interests.map((tag) => (
                  <Pressable
                    key={tag}
                    style={({ pressed }) => [styles.tag, pressed && styles.rowPressed]}
                    onPress={() => onOpenTagFeed?.(tag)}
                  >
                    <Text style={styles.tagText}>{tag}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.belowCard}>
        <ThemePicker
          styles={styles}
          preference={preference}
          onSelect={setThemePreference}
          t={t}
        />

        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <StatBox
              key={stat.label}
              styles={styles}
              stat={stat}
              onPress={onStatPress}
            />
          ))}
        </View>

        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, index) => (
            <View key={item.id}>
              <MenuRow styles={styles} item={item} counts={menuCounts} onPress={onMenuPress} t={t} />
              {index < MENU_ITEMS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
        </View>
      </ScrollView>
    </View>
  );
}

function createProfileStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 24, paddingTop: 16 },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingVertical: 6,
      paddingRight: 12,
      marginBottom: 4,
    },
    backIcon: { fontSize: 20, color: colors.accent, marginRight: 4 },
    backLabel: { fontSize: 16, fontWeight: '500', color: colors.accent },
    list: { flex: 1 },
    listContent: { paddingTop: 0, paddingBottom: 16 },
    belowCard: { paddingHorizontal: 24, paddingTop: 16 },
    profileCard: {
      backgroundColor: colors.surface,
      marginBottom: 16,
      overflow: 'hidden',
    },
    coverSection: {
      height: COVER_HEIGHT + AVATAR_OVERLAP,
      width: '100%',
      position: 'relative',
    },
    coverImageArea: {
      height: COVER_HEIGHT,
      width: '100%',
      position: 'relative',
    },
    coverGradient: {
      width: '100%',
      height: COVER_HEIGHT,
    },
    coverImage: {
      width: '100%',
      height: COVER_HEIGHT,
    },
    avatarRow: {
      position: 'absolute',
      top: COVER_HEIGHT - AVATAR_OVERLAP,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 3,
    },
    profileBody: {
      paddingTop: 8,
      paddingHorizontal: 16,
      paddingBottom: 20,
      alignItems: 'center',
    },
    avatarLarge: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
      backgroundColor: colors.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 4,
      borderColor: colors.surface,
    },
    avatarImage: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
      borderWidth: 4,
      borderColor: colors.surface,
    },
    avatarText: { fontSize: 36, fontWeight: '700', color: colors.accent },
    name: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 6,
      textAlign: 'center',
    },
    statsLine: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 6,
      textAlign: 'center',
    },
    profession: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.textSecondary,
      marginBottom: 16,
      textAlign: 'center',
    },
    location: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 12,
      textAlign: 'center',
    },
    infoSection: {
      width: '100%',
      marginBottom: 16,
    },
    infoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    infoTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
    },
    infoEditButton: {
      padding: 4,
    },
    infoEditText: {
      fontSize: 16,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      gap: 10,
    },
    infoIcon: {
      fontSize: 18,
      width: 24,
      textAlign: 'center',
    },
    infoText: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
    },
    bio: {
      fontSize: 15,
      lineHeight: 22,
      color: '#FFFFFF',
      marginBottom: 16,
      textAlign: 'center',
      width: '100%',
    },
    linksRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
      justifyContent: 'center',
    },
    linkButton: {
      backgroundColor: colors.accentSoft,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
    },
    linkText: { fontSize: 13, fontWeight: '600', color: colors.accent },
    interests: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
    tag: {
      backgroundColor: colors.accentSoft,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    tagText: { fontSize: 13, fontWeight: '500', color: colors.accent },
    themeCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: colors.background === '#000000' ? 0.2 : 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    themeTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    themeRow: {
      flexDirection: 'row',
      gap: 8,
    },
    themeOption: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 6,
      borderRadius: 12,
      backgroundColor: colors.surfaceSecondary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    themeOptionSelected: {
      backgroundColor: colors.accentSoft,
      borderColor: colors.accent,
    },
    themeEmoji: { fontSize: 22, marginBottom: 6 },
    themeLabel: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textSecondary,
      textAlign: 'center',
    },
    themeLabelSelected: {
      color: colors.accent,
      fontWeight: '600',
    },
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    statBox: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: 'center',
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: colors.background === '#000000' ? 0.2 : 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    statValue: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 2 },
    statLabel: { fontSize: 13, color: colors.textMuted },
    menuCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: colors.background === '#000000' ? 0.2 : 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    menuRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 18,
      paddingVertical: 16,
    },
    rowPressed: { backgroundColor: colors.pressed },
    menuEmoji: { fontSize: 20, marginRight: 14 },
    menuLabel: { flex: 1, fontSize: 16, color: colors.text },
    menuArrow: { fontSize: 22, color: colors.textMuted },
    divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 18 },
  });
}
