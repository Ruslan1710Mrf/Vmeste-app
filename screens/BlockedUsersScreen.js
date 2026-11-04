import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchUserProfile } from '../lib/userProfileService';
import { useTheme } from '../lib/ThemeContext';
import { useI18n } from '../lib/i18n';

export default function BlockedUsersScreen({ blockedIds, onUnblock, onBack }) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [busy, setBusy] = useState(null);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    Promise.allSettled(blockedIds.map(async (id) => [id, await fetchUserProfile(id)]))
      .then((results) => {
        if (cancelled) return;
        setProfiles(Object.fromEntries(results.filter((r) => r.status === 'fulfilled').map((r) => r.value)));
        setFailed(results.some((r) => r.status === 'rejected'));
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [blockedIds, retry]);
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <Pressable onPress={onBack} accessibilityRole="button" style={{ padding: 20 }}>
        <Text style={{ color: colors.accent, fontSize: 17 }}>← {t('settings.title')}</Text>
      </Pressable>
      <Text style={{ color: colors.text, fontSize: 26, fontWeight: '700', paddingHorizontal: 20 }}>{t('blockedUsers.title')}</Text>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }}>
        {loading ? <ActivityIndicator color={colors.accent} /> : null}
        {failed ? <Pressable onPress={() => setRetry((v) => v + 1)} style={{ paddingVertical: 16 }}><Text style={{ color: colors.accent }}>{t('blockedUsers.retry')}</Text></Pressable> : null}
        {!loading && !blockedIds.length ? <Text style={{ color: colors.textSecondary }}>{t('blockedUsers.empty')}</Text> : null}
        {blockedIds.map((id) => (
          <View key={id} style={{ padding: 16, borderRadius: 16, backgroundColor: colors.surface, marginBottom: 12 }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600' }}>{profiles[id]?.name || t('blockedUsers.unavailable')}</Text>
            {profiles[id]?.city ? <Text style={{ color: colors.textSecondary, marginTop: 4 }}>{profiles[id].city}</Text> : null}
            <Pressable accessibilityRole="button" disabled={busy !== null} onPress={async () => {
              setBusy(id);
              try { await onUnblock(id); } finally { setBusy(null); }
            }} style={{ paddingVertical: 14 }}>
              {busy === id ? <ActivityIndicator color={colors.accent} /> : <Text style={{ color: colors.accent, fontWeight: '600' }}>{t('memberDetail.unblock')}</Text>}
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
