import { Link, useRouter } from 'expo-router';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { useEffect, useState } from 'react';
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
import { auth, app } from '../../lib/firebase';
import styles from './phoneAuthStyles';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier | null;
  }
}

function formatPhoneNumber(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith('+')) {
    return `+${trimmed.slice(1).replace(/\D/g, '')}`;
  }
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  return `+${digits}`;
}

function mapPhoneAuthError(code: string): string {
  const messages: Record<string, string> = {
    'auth/invalid-phone-number': 'Неверный формат номера телефона',
    'auth/missing-phone-number': 'Введите номер телефона',
    'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже',
    'auth/quota-exceeded': 'Превышен лимит SMS. Попробуйте позже',
    'auth/captcha-check-failed': 'Проверка reCAPTCHA не пройдена',
    'auth/invalid-app-credential': 'Ошибка конфигурации Firebase. Проверьте настройки',
  };
  return messages[code] ?? 'Не удалось отправить код. Попробуйте снова';
}

export default function PhoneScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        }
      }
    };
  }, []);

  const sendCode = async () => {
    setError('');
    const phone = formatPhoneNumber(phoneNumber);
    if (phone.length < 11) {
      setError('Введите номер в формате +1XXXXXXXXXX');
      return;
    }

    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      setError('Вход по телефону доступен в веб-версии приложения');
      return;
    }

    if (!document.getElementById('recaptcha-container')) {
      setError('reCAPTCHA не готова. Обновите страницу и попробуйте снова');
      return;
    }

    setLoading(true);
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }

      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
      });
      await window.recaptchaVerifier.render();

      const confirmation = await signInWithPhoneNumber(
        auth,
        phone,
        window.recaptchaVerifier,
      );

      router.push({
        pathname: '/auth/verify',
        params: {
          verificationId: confirmation.verificationId,
          phoneNumber: phone,
        },
      });
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      setError(mapPhoneAuthError(code));
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {Platform.OS === 'web' ? (
        <div id="recaptcha-container" />
      ) : (
        <View nativeID="recaptcha-container" />
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Link href="/auth/login" asChild>
            <Pressable style={styles.backLink}>
              <Text style={styles.backLinkText}>← Назад ко входу</Text>
            </Pressable>
          </Link>

          <Text style={styles.brand}>Vmeste</Text>
          <Text style={styles.title}>Вход по телефону</Text>
          <Text style={styles.subtitle}>
            Введите номер — мы отправим SMS с кодом подтверждения
          </Text>

          <View style={styles.card}>
            <View>
              <Text style={styles.label}>Номер телефона</Text>
              <TextInput
                style={[styles.input, error ? styles.inputError : null]}
                placeholder="+1 (555) 123-4567"
                placeholderTextColor="#64748B"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                autoComplete="tel"
              />
              <Text style={styles.hint}>
                Для США используйте код страны +1
              </Text>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                loading && styles.primaryButtonDisabled,
                pressed && !loading && styles.primaryButtonPressed,
              ]}
              onPress={sendCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Отправить код</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
