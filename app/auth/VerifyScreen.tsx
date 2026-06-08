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
import { createUserProfile, fetchUserProfile } from '../../lib/userProfileService';
import styles from './phoneAuthStyles';

function mapVerifyError(code: string): string {
  const messages: Record<string, string> = {
    'auth/invalid-verification-code': 'Неверный код подтверждения',
    'auth/code-expired': 'Срок действия кода истёк. Запросите новый',
    'auth/missing-verification-code': 'Введите код из SMS',
    'auth/session-expired': 'Сессия истекла. Запросите код заново',
  };
  return messages[code] ?? 'Не удалось подтвердить код. Попробуйте снова';
}

function formatPhoneDisplay(phone: string): string {
  if (!phone) return '';
  return phone.replace(/(\+1)(\d{3})(\d{3})(\d{4})/, '+1 ($2) $3-$4');
}

export default function VerifyScreen() {
  const router = useRouter();
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
      setError('Сессия не найдена. Запросите код заново');
      return;
    }
    if (!code.trim() || code.trim().length < 6) {
      setError('Введите 6-значный код из SMS');
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
            name: user.displayName?.trim() || 'Пользователь',
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
      setError(mapVerifyError(errorCode));
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
              <Text style={styles.backLinkText}>← Изменить номер</Text>
            </Pressable>
          </Link>

          <Text style={styles.brand}>Vmeste</Text>
          <Text style={styles.title}>Код из SMS</Text>
          <Text style={styles.subtitle}>
            {phoneNumber
              ? `Мы отправили код на ${formatPhoneDisplay(phoneNumber)}`
              : 'Введите код из SMS-сообщения'}
          </Text>

          <View style={styles.card}>
            <View>
              <Text style={styles.label}>Код подтверждения</Text>
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
                <Text style={styles.primaryButtonText}>Подтвердить</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
