import Avatar from '../components/Avatar';
import OverviewBack from '../components/OverviewBack';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { GROUPS } from '../data/groups';
import { MEMBERS } from '../data/members';
import { fetchNetworkUsers } from '../lib/userProfileService';
import { localize, useI18n } from '../lib/i18n';
import { useTheme } from '../lib/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function EventCard({ event, onPress }) {
  const styles = useStyles();
  const { t } = useI18n();
  return (
    <Pressable
      style={({ pressed }) => [styles.eventCard, pressed && styles.cardPressed]}
      onPress={() => onPress(event.id)}
    >
      <View style={styles.eventDateBadge}>
        <Text style={styles.eventDate}>{event.date}</Text>
      </View>
      <Text style={styles.eventTitle}>{event.title}</Text>
      <View style={styles.eventMeta}>
        <Text style={styles.eventCity}>📍 {event.city}</Text>
        <Text style={styles.eventAttendees}>{t('networking.attendees', { value: event.attendees })}</Text>
      </View>
    </Pressable>
  );
}

function GroupRow({ group }) {
  const styles = useStyles();
  const { t, language } = useI18n();
  return (
    <Pressable
      style={({ pressed }) => [styles.groupRow, pressed && styles.rowPressed]}
      onPress={() => Linking.openURL(group.url)}
    >
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{localize(group.name, language)}</Text>
        <Text style={styles.groupMeta}>
          {t('networking.membersCount', { value: group.members })} · {group.platform}
        </Text>
      </View>
      <Text style={styles.joinButton}>{t('networking.join')}</Text>
    </Pressable>
  );
}

function MemberCard({ member, onPress, isConnected }) {
  const styles = useStyles();
  const { t } = useI18n();
  return (
    <Pressable
      style={({ pressed }) => [styles.memberCard, pressed && styles.cardPressed]}
      onPress={() => onPress(member.id)}
    >
      <Avatar name={member.name} uri={member.photoUri} style={{ marginRight: 12 }} />
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{member.name}</Text>
        <Text style={styles.memberRole}>{member.role || t('networking.communityMember')}</Text>
        <Text style={styles.memberCity}>{member.country} {member.city}</Text>
      </View>
      <Text style={[styles.connectButton, isConnected && styles.connectedButton]}>
        {isConnected ? '✓' : '+'}
      </Text>
    </Pressable>
  );
}

export default function NetworkingScreen({
  onBack,
  events,
  onSelectEvent,
  onSelectMember,
  onCreateEvent,
  connectedIds,
  userId,
  blockedUserIds = [],
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { t, language } = useI18n();
  const [query, setQuery] = useState('');
  const [firestoreMembers, setFirestoreMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const q = query.trim().toLowerCase();

  useEffect(() => {
    let cancelled = false;
    setMembersLoading(true);

    fetchNetworkUsers(50, userId)
      .then((members) => {
        if (!cancelled) setFirestoreMembers(members);
      })
      .catch(() => {
        if (!cancelled) setFirestoreMembers([]);
      })
      .finally(() => {
        if (!cancelled) setMembersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const allMembers = useMemo(() => {
    const seen = new Set(firestoreMembers.map((member) => member.id));
    const mockOnly = MEMBERS.filter((member) => !seen.has(member.id));
    return [...firestoreMembers, ...mockOnly].filter(
      (member) => !blockedUserIds.includes(member.id),
    );
  }, [firestoreMembers, blockedUserIds]);

  const filteredEvents = useMemo(() => {
    if (!q) return events;
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q),
    );
  }, [q, events]);

  const filteredGroups = useMemo(() => {
    if (!q) return GROUPS;
    return GROUPS.filter(
      (g) =>
        localize(g.name, language).toLowerCase().includes(q) ||
        g.platform.toLowerCase().includes(q),
    );
  }, [q, language]);

  const filteredMembers = useMemo(() => {
    if (!q) return allMembers;
    return allMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.city.toLowerCase().includes(q),
    );
  }, [q, allMembers]);

  const hasResults =
    filteredEvents.length > 0 ||
    filteredGroups.length > 0 ||
    filteredMembers.length > 0;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: 8 + insets.top }]}><OverviewBack onPress={onBack} />
        <Text style={styles.screenTitle}>{t('networking.title')}</Text>
        <Text style={styles.screenSubtitle}>
          {t('networking.subtitle')}
        </Text>
        <TextInput
          style={styles.searchInput}
          placeholder={t('networking.searchPlaceholder')}
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {!hasResults && (
          <Text style={styles.empty}>{t('networking.noResults')}</Text>
        )}

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{t('networking.upcomingEvents')}</Text>
          <Pressable onPress={onCreateEvent}>
            <Text style={styles.createEventLink}>＋ {t('networking.create')}</Text>
          </Pressable>
        </View>
        {filteredEvents.length > 0 && (
          <View style={styles.eventsList}>
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} onPress={onSelectEvent} />
            ))}
          </View>
        )}

        {filteredGroups.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{t('networking.communities')}</Text>
            <View style={styles.groupsCard}>
              {filteredGroups.map((group, index) => (
                <View key={group.id}>
                  <GroupRow group={group} />
                  {index < filteredGroups.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </>
        )}

        {membersLoading ? (
          <ActivityIndicator style={{ marginTop: 16, marginBottom: 24 }} color={colors.accent} />
        ) : filteredMembers.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>{t('networking.peopleNearYou')}</Text>
            <View style={styles.membersList}>
              {filteredMembers.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onPress={onSelectMember}
                  isConnected={connectedIds.includes(member.id)}
                />
              ))}
            </View>
          </>
        ) : null}
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
    container: {
      backgroundColor: colors.background,
      flex: 1,
    },
    header: {
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 20,
    },
    screenTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.5,
      marginBottom: 6,
    },
    screenSubtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 22,
      marginBottom: 16,
    },
    searchInput: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.text,
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    },
    empty: {
      textAlign: 'center',
      fontSize: 15,
      color: colors.textMuted,
      marginTop: 24,
      marginBottom: 16,
    },
    list: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: 24,
      paddingBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
      marginTop: 8,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    createEventLink: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.tabActive,
      marginBottom: 12,
    },
    eventsList: {
      gap: 12,
      marginBottom: 24,
    },
    eventCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 18,
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    eventDateBadge: {
      alignSelf: 'flex-start',
      backgroundColor: colors.accentSoft,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      marginBottom: 10,
    },
    eventDate: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.tabActive,
    },
    eventTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 10,
    },
    eventMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    eventCity: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    eventAttendees: {
      fontSize: 13,
      color: colors.textMuted,
    },
    groupsCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      marginBottom: 24,
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    groupRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
      paddingVertical: 16,
    },
    rowPressed: {
      backgroundColor: colors.surfaceSecondary,
    },
    groupInfo: {
      flex: 1,
      marginRight: 12,
    },
    groupName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    groupMeta: {
      fontSize: 13,
      color: colors.textMuted,
    },
    joinButton: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.tabActive,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: 18,
    },
    membersList: {
      gap: 10,
    },
    memberCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    avatarText: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.tabActive,
    },
    memberInfo: {
      flex: 1,
    },
    memberName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    memberRole: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    memberCity: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 2,
    },
    connectButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.accentSoft,
      textAlign: 'center',
      lineHeight: 34,
      fontSize: 22,
      fontWeight: '400',
      color: colors.tabActive,
      overflow: 'hidden',
    },
    connectedButton: {
      backgroundColor: colors.accentSoft,
      color: colors.tabActive,
      lineHeight: 36,
      fontSize: 18,
    },
    cardPressed: {
      opacity: 0.92,
      transform: [{ scale: 0.99 }],
    },
  });
}
