import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../lib/firebase';
import { useI18n } from '../../lib/i18n';
import { createUserProfile, fetchUserProfile } from '../../lib/userProfileService';
import styles from './phoneAuthStyles';

// Возвращает ключ перевода (lib/i18n.js), а не готовый текст — экран должен
// передать его через t() с учётом выбранного языка интерфейса.
function mapVerifyError(code: string): string {
  const keys: Record<string, string> = {
    'auth/invalid-verification-code': 'verify.errors.invalidCode',
    'auth/code-expired': 'verify.errors.codeExpired',
    'auth/missing-verification-code': 'verify.errors.missingCode',
    'auth/session-expired': 'verify.errors.sessionExpired',
  };
  return keys[code] ?? 'verify.errors.generic';
}

function formatPhoneDisplay(phone: string): string {
  if (!phone) return '';
  return phone.replace(/(\+1)(\d{3})(\d{3})(\d{4})/, '+1 ($2) $3-$4');
}

export default function VerifyScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { verificationId, phoneNumber } = useLocalSearchParams<{
    verificationId?: string;
    phoneNumber?: string;
  }>();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setError('');
    if (!verificationId) {
      setError(t('verify.errors.sessionNotFound'));
      return;
    }
    if (!code.trim() || code.trim().length < 6) {
      setError(t('verify.errors.enterSixDigitCode'));
      return;
    }

    setLoading(true);
    try {
      const credential = PhoneAuthProvider.credential(verificationId, code.trim());
      const result = await signInWithCredential(auth, credential);
      const user = result.user;

      try {
        const existing = await fetchUserProfile(user.uid);
        if (!existing) {
          await createUserProfile(user.uid, {
            uid: user.uid,
            name: user.displayName?.trim() || t('verify.defaultUserName'),
            email: user.email ?? '',
            city: '',
            interests: [],
          });
        }
      } catch {
        // Профиль будет загружен в App.js
      }

      router.replace('/(tabs)');
    } catch (err: unknown) {
      const errorCode = (err as { code?: string }).code ?? '';
      setError(t(mapVerifyError(errorCode)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Link href="/auth/phone" asChild>
            <Pressable style={styles.backLink}>
              <Text style={styles.backLinkText}>{t('verify.changeNumber')}</Text>
            </Pressable>
          </Link>

          <Text style={styles.brand}>Vmeste</Text>
          <Text style={styles.title}>{t('verify.title')}</Text>
          <Text style={styles.subtitle}>
            {phoneNumber
              ? `${t('verify.codeSentToPrefix')} ${formatPhoneDisplay(phoneNumber)}`
              : t('verify.enterCodeFromSms')}
          </Text>

          <View style={styles.card}>
            <View>
              <Text style={styles.label}>{t('verify.codeLabel')}</Text>
              <TextInput
                style={[styles.input, error ? styles.inputError : null]}
                placeholder="123456"
                placeholderTextColor="#64748B"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                maxLength={6}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                loading && styles.primaryButtonDisabled,
                pressed && !loading && styles.primaryButtonPressed,
              ]}
              onPress={handleVerify}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>{t('verify.confirm')}</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
