import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
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
  getAuthProvider,
  sendPasswordReset,
  signOut,
  reauthenticateWithPassword,
  reauthenticateWithGoogle,
  reauthenticateWithApple,
  deleteCurrentAccount,
} from '../lib/authService';
import { deleteUserProfile } from '../lib/userProfileService';
import { deleteUserPosts } from '../lib/postService';
import { deleteUserConversations } from '../lib/messageService';
import { deleteUserAiChats } from '../lib/aiChatService';
import { deleteUserBlocks } from '../lib/blockService';
import { deleteUserConnections } from '../lib/connectionService';
import { deleteUserNotifications } from '../lib/notificationService';
import { requestPushPermission, setEventReminders, setPushEnabled, unregisterPushToken } from '../lib/pushService';
import { deleteUserAttendance, deleteUserEvents } from '../lib/eventService';
import { deleteUserStorageFiles } from '../lib/postImageService';
import { LANGUAGES } from '../lib/chatUtils';
import { useI18n } from '../lib/i18n';
import { useTheme } from '../lib/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const styles = useStyles();
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
  const styles = useStyles();
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

export default function SettingsScreen({ onBack, settings, onUpdateSettings, onOpenBlockedUsers }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, language: currentLanguage, setLanguage } = useI18n();
  const [signingOut, setSigningOut] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const accountEmail = getCurrentUser()?.email ?? '';
  const authProvider = getAuthProvider(); // 'password' | 'google.com' | 'apple.com'

  const updateSetting = (key, value) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  // Переключатель влияет на сервер: Cloud Functions не шлют пуши при enabled: false.
  const handlePushToggle = async (value) => {
    updateSetting('pushEnabled', value);
    const uid = getCurrentUser()?.uid;
    if (!uid) return;
    try {
      await setPushEnabled(uid, value);
      if (value) await requestPushPermission(uid, { force: true });
    } catch (err) {
      console.warn('[settings] push toggle failed', err);
    }
  };

  const handleEventRemindersToggle = async (value) => {
    updateSetting('eventReminders', value);
    const uid = getCurrentUser()?.uid;
    if (!uid) return;
    try {
      await setEventReminders(uid, value);
    } catch (err) {
      console.warn('[settings] event reminders toggle failed', err);
    }
  };

  const handleSignOut = async () => {
    const confirmed = await confirmSignOut(t);
    if (!confirmed) return;

    setSigningOut(true);
    try {
      const uid = getCurrentUser()?.uid;
      if (uid) await unregisterPushToken(uid);
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

  // Общий код удаления данных — используется всеми провайдерами
  const runDeletionSteps = async (uid) => {
    const steps = [
      { label: 'posts', fn: () => deleteUserPosts(uid) },
      { label: 'conversations', fn: () => deleteUserConversations(uid) },
      { label: 'aiChats', fn: () => deleteUserAiChats(uid) },
      { label: 'blocks', fn: () => deleteUserBlocks(uid) },
      { label: 'connections', fn: () => deleteUserConnections(uid) },
      { label: 'notifications', fn: () => deleteUserNotifications(uid) },
      { label: 'events', fn: () => deleteUserEvents(uid) },
      { label: 'attendance', fn: () => deleteUserAttendance(uid) },
      { label: 'profile', fn: () => deleteUserProfile(uid) },
      { label: 'storage', fn: () => deleteUserStorageFiles(uid) },
    ];
    for (const step of steps) {
      console.log(`[deleteAccount] ▶ ${step.label}`);
      try {
        await step.fn();
        console.log(`[deleteAccount] ✓ ${step.label}`);
      } catch (err) {
        console.error(`[deleteAccount] ✗ FAILED: ${step.label}`, err?.code, err?.message);
        throw new Error(`Ошибка при удалении [${step.label}]: ${err?.message ?? err}`);
      }
    }
  };

  const finishDeletion = async () => {
    const uid = getCurrentUser()?.uid;
    if (!uid) throw new Error('Не удалось определить UID пользователя');
    await runDeletionSteps(uid);
    await deleteCurrentAccount();
    setShowPasswordPrompt(false);
    setPasswordInput('');
    Alert.alert(t('settings.accountDeletedTitle'), t('settings.accountDeletedMessage'), [
      { text: t('settings.ok'), onPress: () => router.replace('/auth/login') },
    ]);
  };

  // Удаление для email/password
  const handleDeleteAccountPassword = async () => {
    if (!passwordInput.trim()) {
      Alert.alert(t('settings.error'), t('settings.passwordRequiredError'));
      return;
    }
    setDeletingAccount(true);
    try {
      await reauthenticateWithPassword(passwordInput);
      await finishDeletion();
      // Для email/password дополнительно реаутентифицируемся перед deleteUser —
      // на случай если длительное удаление данных исчерпало окно recent-login.
    } catch (error) {
      // Если finishDeletion упал с requires-recent-login — пробуем реаутентифицироваться
      // и удалить аккаунт ещё раз.
      if (error?.code === 'auth/requires-recent-login') {
        try {
          await reauthenticateWithPassword(passwordInput);
          await deleteCurrentAccount();
          setShowPasswordPrompt(false);
          setPasswordInput('');
          Alert.alert(t('settings.accountDeletedTitle'), t('settings.accountDeletedMessage'), [
            { text: t('settings.ok'), onPress: () => router.replace('/auth/login') },
          ]);
          return;
        } catch {
          // fall through to generic error
        }
      }
      Alert.alert(
        t('settings.error'),
        error instanceof Error ? error.message : t('settings.genericDeleteError'),
      );
      setPasswordInput('');
    } finally {
      setDeletingAccount(false);
    }
  };

  // Удаление для Google
  const handleDeleteAccountGoogle = async () => {
    setDeletingAccount(true);
    try {
      await reauthenticateWithGoogle();
      await finishDeletion();
    } catch (error) {
      // Пользователь отменил попап Google — тихо игнорируем
      const code = error?.code ?? '';
      if (code === 'SIGN_IN_CANCELLED' || code === 'sign_in_cancelled' || code === '12501') return;
      Alert.alert(
        t('settings.error'),
        error instanceof Error ? error.message : t('settings.genericDeleteError'),
      );
    } finally {
      setDeletingAccount(false);
    }
  };

  // Удаление для Apple
  const handleDeleteAccountApple = async () => {
    setDeletingAccount(true);
    try {
      await reauthenticateWithApple();
      await finishDeletion();
    } catch (error) {
      // Пользователь отменил попап Apple — тихо игнорируем
      const code = error?.code ?? '';
      if (code === 'ERR_REQUEST_CANCELED' || code === '1001') return;
      Alert.alert(
        t('settings.error'),
        error instanceof Error ? error.message : t('settings.genericDeleteError'),
      );
    } finally {
      setDeletingAccount(false);
    }
  };

  const closeDeleteModal = () => {
    if (!deletingAccount) {
      setShowPasswordPrompt(false);
      setPasswordInput('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: 16 + insets.top }]}>
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
            onValueChange={handlePushToggle}
          />
          {/* «Email-дайджест» скрыт: рассылки нет. Вернуть, когда появится. */}
          <View style={styles.divider} />
          <SettingRow
            label={t('settings.eventRemindersTitle')}
            value={settings.eventReminders}
            onValueChange={handleEventRemindersToggle}
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

        <View style={styles.card}>
          <Pressable style={styles.actionRow} onPress={onOpenBlockedUsers} accessibilityRole="button">
            <Text style={styles.actionText}>{t('blockedUsers.title')} →</Text>
          </Pressable>
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

      <Modal
        visible={showPasswordPrompt}
        transparent
        animationType="slide"
        onRequestClose={closeDeleteModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={{ flex: 1 }} onPress={closeDeleteModal} />

          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('settings.deleteAccount')}</Text>

            {authProvider === 'password' ? (
              /* ── Email/пароль ── */
              <>
                <Text style={styles.modalDescription}>
                  {t('settings.passwordPromptDesc')}
                </Text>
                <TextInput
                  style={styles.passwordInput}
                  placeholder={t('settings.passwordPlaceholder')}
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  value={passwordInput}
                  onChangeText={setPasswordInput}
                  editable={!deletingAccount}
                  autoFocus
                />
                <View style={styles.modalButtons}>
                  <Pressable
                    style={({ pressed }) => [styles.modalButtonCancel, pressed && styles.backPressed]}
                    onPress={closeDeleteModal}
                    disabled={deletingAccount}
                  >
                    <Text style={styles.modalButtonCancelText}>{t('settings.cancel')}</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [styles.modalButtonDelete, pressed && !deletingAccount && styles.backPressed]}
                    onPress={handleDeleteAccountPassword}
                    disabled={deletingAccount}
                  >
                    {deletingAccount ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.modalButtonDeleteText}>{t('settings.delete')}</Text>
                    )}
                  </Pressable>
                </View>
              </>
            ) : (
              /* ── Google или Apple ── */
              <>
                <Text style={styles.modalDescription}>
                  {authProvider === 'google.com'
                    ? 'Для удаления аккаунта подтвердите личность через Google.'
                    : 'Для удаления аккаунта подтвердите личность через Apple.'}
                </Text>
                <View style={styles.modalButtons}>
                  <Pressable
                    style={({ pressed }) => [styles.modalButtonCancel, pressed && styles.backPressed]}
                    onPress={closeDeleteModal}
                    disabled={deletingAccount}
                  >
                    <Text style={styles.modalButtonCancelText}>{t('settings.cancel')}</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [styles.modalButtonDelete, pressed && !deletingAccount && styles.backPressed]}
                    onPress={authProvider === 'google.com' ? handleDeleteAccountGoogle : handleDeleteAccountApple}
                    disabled={deletingAccount}
                  >
                    {deletingAccount ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.modalButtonDeleteText}>
                        {authProvider === 'google.com' ? 'Войти через Google' : 'Войти через Apple'}
                      </Text>
                    )}
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    },
    list: { paddingHorizontal: 24, paddingBottom: 24 },
    sectionLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textMuted,
      marginBottom: 10,
      marginTop: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    card: {
      backgroundColor: colors.surface,
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
    rowLabel: { fontSize: 16, color: colors.text },
    rowDesc: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
    divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 18 },
    langSectionTitle: {
      fontSize: 16,
      color: colors.text,
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
      backgroundColor: colors.accentSoft,
    },
    langOptionLabel: {
      fontSize: 16,
      color: colors.text,
    },
    langOptionLabelSelected: {
      fontWeight: '600',
      color: colors.accent,
    },
    langCheck: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.accent,
    },
    accountRow: {
      paddingHorizontal: 18,
      paddingVertical: 16,
    },
    accountEmail: {
      fontSize: 14,
      color: colors.textSecondary,
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
      color: colors.textMuted,
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
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 32,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    modalDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 16,
      lineHeight: 20,
    },
    passwordInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
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
      borderColor: colors.border,
      alignItems: 'center',
    },
    modalButtonCancelText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textSecondary,
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
}
