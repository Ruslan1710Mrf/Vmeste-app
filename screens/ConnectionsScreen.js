import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { fetchUsersByIds } from '../lib/userProfileService';
import { useI18n } from '../lib/i18n';
import { useTheme } from '../lib/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function ConnectionRow({ member, onPress, onMessage }) {
  const styles = useStyles();
  const { t } = useI18n();
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={() => onPress(member.id)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{member.name.charAt(0)}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{member.name}</Text>
        <Text style={styles.role}>{member.role || t('networking.communityMember')}</Text>
        <Text style={styles.city}>📍 {member.city}</Text>
      </View>
      <Pressable
        style={({ pressed }) => [styles.msgButton, pressed && styles.msgPressed]}
        onPress={() => onMessage(member.id)}
      >
        <Text style={styles.msgIcon}>💬</Text>
      </Pressable>
    </Pressable>
  );
}

export default function ConnectionsScreen({
  connectedIds,
  onBack,
  onOpenMember,
  onMessage,
}) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchUsersByIds(connectedIds)
      .then((members) => {
        if (!cancelled) setConnections(members);
      })
      .catch(() => {
        if (!cancelled) setConnections([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [connectedIds]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: 16 + insets.top }]}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}
          onPress={onBack}
        >
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backLabel}>{t('connections.backLabel')}</Text>
        </Pressable>
        <Text style={styles.screenTitle}>{t('connections.title')}</Text>
        <Text style={styles.screenSubtitle}>{t('connections.peopleCount', { value: connections.length })}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color="#7C3AED" />
        ) : connections.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🤝</Text>
            <Text style={styles.emptyTitle}>{t('connections.emptyTitle')}</Text>
            <Text style={styles.emptyText}>
              {t('connections.emptyText')}
            </Text>
          </View>
        ) : (
          <View style={styles.card}>
            {connections.map((member, index) => (
              <View key={member.id}>
                <ConnectionRow
                  member={member}
                  onPress={onOpenMember}
                  onMessage={onMessage}
                />
                {index < connections.length - 1 && <View style={styles.divider} />}
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
    screenTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.5,
      marginBottom: 6,
    },
    screenSubtitle: { fontSize: 15, color: colors.textSecondary },
    list: { paddingHorizontal: 24, paddingBottom: 16, flexGrow: 1 },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    row: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    rowPressed: { backgroundColor: colors.surfaceSecondary },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#F3E8FF',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    avatarText: { fontSize: 18, fontWeight: '600', color: '#7C3AED' },
    content: { flex: 1 },
    name: { fontSize: 16, fontWeight: '600', color: colors.text },
    role: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
    city: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
    msgButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    msgPressed: { opacity: 0.7 },
    msgIcon: { fontSize: 18 },
    divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 16 },
    empty: { alignItems: 'center', paddingTop: 60 },
    emptyEmoji: { fontSize: 48, marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: 8 },
    emptyText: {
      fontSize: 15,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 22,
      paddingHorizontal: 32,
    },
  });
}
