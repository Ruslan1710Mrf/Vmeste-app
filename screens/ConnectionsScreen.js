import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { fetchUsersByIds } from '../lib/userProfileService';
import { useI18n } from '../lib/i18n';
import { useTheme } from '../lib/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function PersonRow({ member, isFriend, onPress, onMessage, onAdd, onRemove }) {
  const styles = useStyles();
  const { t } = useI18n();
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={() => onPress(member.id)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{(member.name || '?').charAt(0)}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{member.name}</Text>
        <Text style={styles.role}>{member.role || t('networking.communityMember')}</Text>
        {!!member.city && <Text style={styles.city}>📍 {member.city}</Text>}
      </View>
      {isFriend ? (
        <View style={styles.rowActions}>
          <Pressable
            style={({ pressed }) => [styles.msgButton, pressed && styles.pressed]}
            onPress={() => onMessage(member.id)}
          >
            <Text style={styles.msgIcon}>💬</Text>
          </Pressable>
          {!!onRemove && (
            <Pressable
              style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
              onPress={() => onRemove(member.id)}
            >
              <Text style={styles.removeText}>{t('connections.remove')}</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <Pressable
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          onPress={() => onAdd(member.id)}
        >
          <Text style={styles.addText}>{t('connections.add')}</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

export default function ConnectionsScreen({
  connectedIds,
  currentUserId,
  onBack,
  onOpenMember,
  onMessage,
  onConnect,
  onDisconnect,
  onSearch,
}) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchSeq = useRef(0);

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

  // Поиск с задержкой, чтобы не дёргать базу на каждую букву.
  useEffect(() => {
    const term = query.trim();
    if (!term || !onSearch) {
      setResults([]);
      setSearching(false);
      return undefined;
    }
    setSearching(true);
    const seq = ++searchSeq.current;
    const timer = setTimeout(() => {
      onSearch(term)
        .then((found) => {
          if (seq !== searchSeq.current) return;
          setResults((found || []).filter((m) => m.id !== currentUserId));
        })
        .catch(() => {
          if (seq === searchSeq.current) setResults([]);
        })
        .finally(() => {
          if (seq === searchSeq.current) setSearching(false);
        });
    }, 350);
    return () => clearTimeout(timer);
  }, [query, onSearch, currentUserId]);

  const isSearchMode = query.trim().length > 0;
  const friendIds = new Set(connectedIds);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: 16 + insets.top }]}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          onPress={onBack}
        >
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backLabel}>{t('connections.backLabel')}</Text>
        </Pressable>
        <Text style={styles.screenTitle}>{t('connections.title')}</Text>
        <Text style={styles.screenSubtitle}>{t('connections.peopleCount', { value: connections.length })}</Text>
        <TextInput
          style={styles.search}
          value={query}
          onChangeText={setQuery}
          placeholder={t('connections.searchPlaceholder')}
          placeholderTextColor={styles._muted.color}
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isSearchMode ? (
          searching ? (
            <ActivityIndicator style={{ marginTop: 40 }} color={styles._accent.color} />
          ) : results.length === 0 ? (
            <Text style={styles.hint}>{t('connections.noResults')}</Text>
          ) : (
            <View style={styles.card}>
              {results.map((member, index) => (
                <View key={member.id}>
                  <PersonRow
                    member={member}
                    isFriend={friendIds.has(member.id)}
                    onPress={onOpenMember}
                    onMessage={onMessage}
                    onAdd={onConnect}
                  />
                  {index < results.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          )
        ) : loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={styles._accent.color} />
        ) : connections.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🤝</Text>
            <Text style={styles.emptyTitle}>{t('connections.emptyTitle')}</Text>
            <Text style={styles.emptyText}>{t('connections.searchHint')}</Text>
          </View>
        ) : (
          <View style={styles.card}>
            {connections.map((member, index) => (
              <View key={member.id}>
                <PersonRow
                  member={member}
                  isFriend
                  onPress={onOpenMember}
                  onMessage={onMessage}
                  onRemove={onDisconnect}
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
    _muted: { color: colors.textMuted },
    _accent: { color: colors.accent },
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12 },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      marginBottom: 16,
      paddingVertical: 6,
      paddingRight: 12,
    },
    pressed: { opacity: 0.6 },
    backIcon: { fontSize: 20, color: colors.accent, marginRight: 4 },
    backLabel: { fontSize: 16, fontWeight: '500', color: colors.accent },
    screenTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.5,
      marginBottom: 6,
    },
    screenSubtitle: { fontSize: 15, color: colors.textSecondary, marginBottom: 14 },
    search: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    list: { paddingHorizontal: 24, paddingBottom: 16, flexGrow: 1 },
    hint: { textAlign: 'center', color: colors.textMuted, fontSize: 15, marginTop: 40, paddingHorizontal: 24, lineHeight: 22 },
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
      backgroundColor: colors.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    avatarText: { fontSize: 18, fontWeight: '600', color: colors.accent },
    content: { flex: 1 },
    name: { fontSize: 16, fontWeight: '600', color: colors.text },
    role: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
    city: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
    rowActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    msgButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    msgIcon: { fontSize: 18 },
    addButton: {
      paddingHorizontal: 16,
      paddingVertical: 9,
      borderRadius: 10,
      backgroundColor: colors.accent,
    },
    addText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
    removeButton: {
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderRadius: 10,
      backgroundColor: colors.surfaceSecondary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    removeText: { color: colors.textSecondary, fontWeight: '600', fontSize: 13 },
    divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 16 },
    empty: { alignItems: 'center', paddingTop: 48 },
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
