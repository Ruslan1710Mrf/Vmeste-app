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

function EventCard({ event, onPress }) {
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
        <Text style={styles.eventAttendees}>{event.attendees} участников</Text>
      </View>
    </Pressable>
  );
}

function GroupRow({ group }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.groupRow, pressed && styles.rowPressed]}
      onPress={() => Linking.openURL(group.url)}
    >
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{group.name}</Text>
        <Text style={styles.groupMeta}>
          {group.members} участников · {group.platform}
        </Text>
      </View>
      <Text style={styles.joinButton}>Вступить</Text>
    </Pressable>
  );
}

function MemberCard({ member, onPress, isConnected }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.memberCard, pressed && styles.cardPressed]}
      onPress={() => onPress(member.id)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{member.name.charAt(0)}</Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{member.name}</Text>
        <Text style={styles.memberRole}>{member.role}</Text>
        <Text style={styles.memberCity}>{member.country} {member.city}</Text>
      </View>
      <Text style={[styles.connectButton, isConnected && styles.connectedButton]}>
        {isConnected ? '✓' : '+'}
      </Text>
    </Pressable>
  );
}

export default function NetworkingScreen({
  events,
  onSelectEvent,
  onSelectMember,
  onCreateEvent,
  connectedIds,
  userId,
}) {
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
    return [...firestoreMembers, ...mockOnly];
  }, [firestoreMembers]);

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
        g.name.toLowerCase().includes(q) ||
        g.platform.toLowerCase().includes(q),
    );
  }, [q]);

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
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Нетворкинг</Text>
        <Text style={styles.screenSubtitle}>
          События, группы и знакомства в diaspora-сообществе
        </Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск событий, групп, людей..."
          placeholderTextColor="#94A3B8"
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
          <Text style={styles.empty}>Ничего не найдено</Text>
        )}

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Ближайшие события</Text>
          <Pressable onPress={onCreateEvent}>
            <Text style={styles.createEventLink}>＋ Создать</Text>
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
            <Text style={styles.sectionTitle}>Сообщества</Text>
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
          <ActivityIndicator style={{ marginTop: 16, marginBottom: 24 }} color="#7C3AED" />
        ) : filteredMembers.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Люди рядом с вами</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#EC4899',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  screenSubtitle: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1E293B',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  empty: {
    textAlign: 'center',
    fontSize: 15,
    color: '#94A3B8',
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
    color: '#EA580C',
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
    color: '#7C3AED',
    marginBottom: 12,
  },
  eventsList: {
    gap: 12,
    marginBottom: 24,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  eventDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7C3AED',
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 10,
  },
  eventMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventCity: {
    fontSize: 14,
    color: '#64748B',
  },
  eventAttendees: {
    fontSize: 13,
    color: '#94A3B8',
  },
  groupsCard: {
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#F8FAFC',
  },
  groupInfo: {
    flex: 1,
    marginRight: 12,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  groupMeta: {
    fontSize: 13,
    color: '#94A3B8',
  },
  joinButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 18,
  },
  membersList: {
    gap: 10,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#7C3AED',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  memberRole: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  memberCity: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  connectButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3E8FF',
    textAlign: 'center',
    lineHeight: 34,
    fontSize: 22,
    fontWeight: '400',
    color: '#7C3AED',
    overflow: 'hidden',
  },
  connectedButton: {
    backgroundColor: '#DCFCE7',
    color: '#059669',
    lineHeight: 36,
    fontSize: 18,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});
