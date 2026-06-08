import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { getCurrentUser, sendPasswordReset, signOut } from '../lib/authService';

function SettingRow({ label, description, value, onValueChange }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        {description ? <Text style={styles.rowDesc}>{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E2E8F0', true: '#FDBA74' }}
        thumbColor={value ? '#EA580C' : '#FFFFFF'}
      />
    </View>
  );
}

export default function SettingsScreen({ onBack, settings, onUpdateSettings }) {
  const [signingOut, setSigningOut] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const accountEmail = getCurrentUser()?.email ?? '';

  const updateSetting = (key, value) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!accountEmail) return;
    setResettingPassword(true);
    try {
      await sendPasswordReset(accountEmail);
      Alert.alert('Готово', 'Ссылка для смены пароля отправлена на ваш email');
    } catch {
      Alert.alert('Ошибка', 'Не удалось отправить письмо. Попробуйте позже.');
    } finally {
      setResettingPassword(false);
    }
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
        <Text style={styles.screenTitle}>Настройки</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Уведомления</Text>
        <View style={styles.card}>
          <SettingRow
            label="Push-уведомления"
            description="Новые вакансии и сообщения"
            value={settings.pushEnabled}
            onValueChange={(value) => updateSetting('pushEnabled', value)}
          />
          <View style={styles.divider} />
          <SettingRow
            label="Email-дайджест"
            description="Еженедельная сводка"
            value={settings.emailDigest}
            onValueChange={(value) => updateSetting('emailDigest', value)}
          />
          <View style={styles.divider} />
          <SettingRow
            label="Напоминания о событиях"
            value={settings.eventReminders}
            onValueChange={(value) => updateSetting('eventReminders', value)}
          />
        </View>

        <Text style={styles.sectionLabel}>Язык</Text>
        <View style={styles.card}>
          <View style={styles.langRow}>
            <Text style={styles.rowLabel}>Язык приложения</Text>
            <Text style={styles.langValue}>Русский</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Аккаунт</Text>
        <View style={styles.card}>
          {accountEmail ? (
            <>
              <View style={styles.accountRow}>
                <Text style={styles.rowLabel}>Email</Text>
                <Text style={styles.accountEmail}>{accountEmail}</Text>
              </View>
              <View style={styles.divider} />
              <Pressable
                style={({ pressed }) => [styles.actionRow, pressed && styles.backPressed]}
                onPress={handlePasswordReset}
                disabled={resettingPassword}
              >
                {resettingPassword ? (
                  <ActivityIndicator color="#2563EB" />
                ) : (
                  <Text style={styles.actionText}>Сменить пароль</Text>
                )}
              </Pressable>
              <View style={styles.divider} />
            </>
          ) : null}
          <Pressable
            style={({ pressed }) => [styles.signOutRow, pressed && styles.backPressed]}
            onPress={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? (
              <ActivityIndicator color="#EF4444" />
            ) : (
              <Text style={styles.signOutText}>Выйти из аккаунта</Text>
            )}
          </Pressable>
        </View>

        <Text style={styles.version}>Vmeste v1.0.0</Text>
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
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  list: { paddingHorizontal: 24, paddingBottom: 24 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 10,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  rowText: { flex: 1, marginRight: 12 },
  rowLabel: { fontSize: 16, color: '#1E293B' },
  rowDesc: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 18 },
  langRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  langValue: { fontSize: 15, color: '#64748B' },
  accountRow: {
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  accountEmail: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  actionRow: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2563EB',
  },
  signOutRow: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
    color: '#CBD5E1',
    marginTop: 16,
  },
});
