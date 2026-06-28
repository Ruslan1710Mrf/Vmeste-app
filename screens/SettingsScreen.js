import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  getCurrentUser,
  sendPasswordReset,
  signOut,
  reauthenticateWithPassword,
  deleteCurrentAccount,
} from '../lib/authService';
import { deleteUserProfile } from '../lib/userProfileService';
import { deleteUserPosts } from '../lib/postService';
import { deleteUserConversations } from '../lib/messageService';
import { deleteUserAiChats } from '../lib/aiChatService';
import { LANGUAGES } from '../lib/chatUtils';
import { useI18n } from '../lib/i18n';

function confirmSignOut(t) {
  if (Platform.OS === 'web') {
    return Promise.resolve(
      window.confirm(t('settings.signOutConfirmMessage')),
    );
  }

  return new Promise((resolve) => {
    Alert.alert(t('settings.signOutConfirmTitle'), t('settings.signOutConfirmMessage'), [
      { text: t('settings.cancel'), style: 'cancel', onPress: () => resolve(false) },
      { text: t('settings.confirm'), style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}

function LanguageOption({ language, selected, onSelect }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.langOption,
        selected && styles.langOptionSelected,
        pressed && styles.backPressed,
      ]}
      onPress={() => onSelect(language.id)}
    >
      <Text style={[styles.langOptionLabel, selected && styles.langOptionLabelSelected]}>
        {language.label}
      </Text>
      {selected ? <Text style={styles.langCheck}>✓</Text> : null}
    </Pressable>
  );
}

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
  const router = useRouter();
  const { t, language: currentLanguage, setLanguage } = useI18n();
  const [signingOut, setSigningOut] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const accountEmail = getCurrentUser()?.email ?? '';

  const updateSetting = (key, value) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  const handleSignOut = async () => {
    const confirmed = await confirmSignOut(t);
    if (!confirmed) return;

    setSigningOut(true);
    try {
      await signOut();
      router.replace('/auth/login');
    } catch {
      if (Platform.OS === 'web') {
        window.alert(t('settings.signOutError'));
      } else {
        Alert.alert(t('settings.error'), t('settings.signOutError'));
      }
    } finally {
      setSigningOut(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!accountEmail) return;
    setResettingPassword(true);
    try {
      await sendPasswordReset(accountEmail);
      Alert.alert(t('settings.passwordResetSentTitle'), t('settings.passwordResetSentMessage'));
    } catch {
      Alert.alert(t('settings.error'), t('settings.passwordResetError'));
    } finally {
      setResettingPassword(false);
    }
  };

  const confirmDeleteAccount = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `${t('settings.deleteAccountConfirmTitle')}\n\n${t('settings.deleteAccountConfirmMessage')}`,
      );
      if (confirmed) {
        setShowPasswordPrompt(true);
      }
    } else {
      Alert.alert(
        t('settings.deleteAccountConfirmTitle'),
        t('settings.deleteAccountConfirmMessage'),
        [
          { text: t('settings.cancel'), style: 'cancel' },
          {
            text: t('settings.delete'),
            style: 'destructive',
            onPress: () => setShowPasswordPrompt(true),
          },
        ],
      );
    }
  };

  const handleDeleteAccount = async () => {
    if (!passwordInput.trim()) {
      Alert.alert(t('settings.error'), t('settings.passwordRequiredError'));
      return;
    }

    setDeletingAccount(true);
    try {
      // Переаутентифицировать пользователя
      await reauthenticateWithPassword(passwordInput);

      // Получить UID перед удалением
      const currentUser = getCurrentUser();
      const uid = currentUser?.uid;

      if (!uid) {
        throw new Error('Не удалось определить UID пользователя');
      }

      // Удалить все данные пользователя
      await Promise.all([
        deleteUserPosts(uid),
        deleteUserConversations(uid),
        deleteUserAiChats(uid),
        deleteUserProfile(uid),
      ]);

      // Переаутентификация выше могла "протухнуть" за время удаления данных —
      // обновляем сессию прямо перед удалением аккаунта, чтобы не получить
      // requires-recent-login и не остаться без данных, но с живым аккаунтом.
      await reauthenticateWithPassword(passwordInput);

      // Удалить аккаунт Firebase
      await deleteCurrentAccount();

      // Очистить UI и перенаправить
      setShowPasswordPrompt(false);
      setPasswordInput('');
      Alert.alert(t('settings.accountDeletedTitle'), t('settings.accountDeletedMessage'), [
        {
          text: t('settings.ok'),
          onPress: () => {
            router.replace('/auth/login');
          },
        },
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t('settings.genericDeleteError');

      Alert.alert(t('settings.error'), errorMessage);
      setPasswordInput('');
    } finally {
      setDeletingAccount(false);
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
          <Text style={styles.backLabel}>{t('settings.backLabel')}</Text>
        </Pressable>
        <Text style={styles.screenTitle}>{t('settings.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>{t('settings.notifications')}</Text>
        <View style={styles.card}>
          <SettingRow
            label={t('settings.pushTitle')}
            description={t('settings.pushDesc')}
            value={settings.pushEnabled}
            onValueChange={(value) => updateSetting('pushEnabled', value)}
          />
          <View style={styles.divider} />
          <SettingRow
            label={t('settings.emailDigestTitle')}
            description={t('settings.emailDigestDesc')}
            value={settings.emailDigest}
            onValueChange={(value) => updateSetting('emailDigest', value)}
          />
          <View style={styles.divider} />
          <SettingRow
            label={t('settings.eventRemindersTitle')}
            value={settings.eventReminders}
            onValueChange={(value) => updateSetting('eventReminders', value)}
          />
        </View>

        <Text style={styles.sectionLabel}>{t('settings.language')}</Text>
        <View style={styles.card}>
          <Text style={styles.langSectionTitle}>{t('settings.appLanguage')}</Text>
          {LANGUAGES.map((language, index) => (
            <View key={language.id}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <LanguageOption
                language={language}
                selected={currentLanguage === language.id}
                onSelect={(id) => setLanguage(id)}
              />
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>{t('settings.account')}</Text>
        <View style={styles.card}>
          {accountEmail ? (
            <>
              <View style={styles.accountRow}>
                <Text style={styles.rowLabel}>{t('settings.email')}</Text>
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
                  <Text style={styles.actionText}>{t('settings.changePassword')}</Text>
                )}
              </Pressable>
              <View style={styles.divider} />
            </>
          ) : null}
          <Pressable
            style={({ pressed }) => [
              styles.deleteAccountRow,
              pressed && !deletingAccount && styles.backPressed,
            ]}
            onPress={confirmDeleteAccount}
            disabled={deletingAccount}
            accessibilityRole="button"
          >
            {deletingAccount ? (
              <ActivityIndicator color="#DC2626" />
            ) : (
              <Text style={styles.deleteAccountText}>{t('settings.deleteAccount')}</Text>
            )}
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            style={({ pressed }) => [
              styles.signOutRow,
              pressed && !signingOut && styles.backPressed,
            ]}
            onPress={() => {
              void handleSignOut();
            }}
            disabled={signingOut}
            accessibilityRole="button"
          >
            {signingOut ? (
              <ActivityIndicator color="#EF4444" />
            ) : (
              <Text style={styles.signOutText}>{t('settings.signOut')}</Text>
            )}
          </Pressable>
        </View>

        <Text style={styles.version}>{t('settings.version')}</Text>
      </ScrollView>

      {showPasswordPrompt && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('settings.enterPassword')}</Text>
            <Text style={styles.modalDescription}>
              {t('settings.passwordPromptDesc')}
            </Text>
            <TextInput
              style={styles.passwordInput}
              placeholder={t('settings.passwordPlaceholder')}
              placeholderTextColor="#94A3B8"
              secureTextEntry
              value={passwordInput}
              onChangeText={setPasswordInput}
              editable={!deletingAccount}
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButtonCancel,
                  pressed && styles.backPressed,
                ]}
                onPress={() => {
                  setShowPasswordPrompt(false);
                  setPasswordInput('');
                }}
                disabled={deletingAccount}
              >
                <Text style={styles.modalButtonCancelText}>{t('settings.cancel')}</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButtonDelete,
                  pressed && !deletingAccount && styles.backPressed,
                ]}
                onPress={handleDeleteAccount}
                disabled={deletingAccount}
              >
                {deletingAccount ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalButtonDeleteText}>{t('settings.delete')}</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      )}
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
  langSectionTitle: {
    fontSize: 16,
    color: '#1E293B',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 8,
  },
  langOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  langOptionSelected: {
    backgroundColor: '#FFF7ED',
  },
  langOptionLabel: {
    fontSize: 16,
    color: '#1E293B',
  },
  langOptionLabelSelected: {
    fontWeight: '600',
    color: '#EA580C',
  },
  langCheck: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EA580C',
  },
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
  deleteAccountRow: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  deleteAccountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
    color: '#CBD5E1',
    marginTop: 16,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 20,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonCancel: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  modalButtonDelete: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonDeleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
