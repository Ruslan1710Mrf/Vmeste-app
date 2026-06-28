import { Link, useRouter } from 'expo-router';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import { auth } from '../../lib/firebase';
import { useI18n } from '../../lib/i18n';
import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE, type CountryCode } from './countryCodes';
import styles from './phoneAuthStyles';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier | null;
  }
}

const RECAPTCHA_PAGE_URL = 'https://veste-app-bffb0.firebaseapp.com/recaptcha.html';

// Возвращает ключ перевода (lib/i18n.js), а не готовый текст — экран должен
// передать его через t() с учётом выбранного языка интерфейса.
function mapPhoneAuthError(code: string): string {
  const keys: Record<string, string> = {
    'auth/invalid-phone-number': 'phoneAuth.errors.invalidPhoneNumber',
    'auth/missing-phone-number': 'phoneAuth.errors.missingPhoneNumber',
    'auth/too-many-requests': 'phoneAuth.errors.tooManyRequests',
    'auth/quota-exceeded': 'phoneAuth.errors.quotaExceeded',
    'auth/captcha-check-failed': 'phoneAuth.errors.captchaCheckFailed',
    'auth/invalid-app-credential': 'phoneAuth.errors.invalidAppCredential',
  };
  return keys[code] ?? 'phoneAuth.errors.generic';
}

export default function PhoneScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const [country, setCountry] = useState<CountryCode>(DEFAULT_COUNTRY_CODE);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [localNumber, setLocalNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRecaptcha, setShowRecaptcha] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const pendingRef = useRef<{
    resolve: (verificationId: string) => void;
    reject: (error: { code?: string }) => void;
  } | null>(null);

  const requestVerificationIdViaWebView = (phone: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      pendingRef.current = { resolve, reject };
      setShowRecaptcha(true);
      setTimeout(() => {
        webViewRef.current?.postMessage(JSON.stringify({ type: 'send-code', phoneNumber: phone }));
      }, 250);
    });
  };

  const requestVerificationIdViaWeb = async (phone: string): Promise<string> => {
    if (typeof window === 'undefined' || !document.getElementById('recaptcha-container')) {
      throw { code: 'auth/captcha-check-failed' };
    }
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {},
    });
    await window.recaptchaVerifier.render();
    const confirmation = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
    return confirmation.verificationId;
  };

  const handleWebViewMessage = (event: { nativeEvent: { data: string } }) => {
    let data: { type: string; verificationId?: string; code?: string; message?: string };
    try {
      data = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }

    if (data.type === 'code-sent' && data.verificationId) {
      setShowRecaptcha(false);
      pendingRef.current?.resolve(data.verificationId);
      pendingRef.current = null;
    } else if (data.type === 'error') {
      setShowRecaptcha(false);
      pendingRef.current?.reject({ code: data.code });
      pendingRef.current = null;
    }
  };

  const sendCode = async () => {
    setError('');
    const digits = localNumber.replace(/\D/g, '');
    if (!digits) {
      setError(t('phoneAuth.errors.missingPhoneNumber'));
      return;
    }
    const phone = `${country.dialCode}${digits}`;

    setLoading(true);
    try {
      const verificationId =
        Platform.OS === 'web'
          ? await requestVerificationIdViaWeb(phone)
          : await requestVerificationIdViaWebView(phone);

      router.push({
        pathname: '/auth/verify',
        params: { verificationId, phoneNumber: phone },
      });
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      setError(t(mapPhoneAuthError(code)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {Platform.OS === 'web' ? (
        <div id="recaptcha-container" />
      ) : null}

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
              <Text style={styles.backLinkText}>{t('phoneAuth.backLink')}</Text>
            </Pressable>
          </Link>

          <Text style={styles.brand}>Vmeste</Text>
          <Text style={styles.title}>{t('phoneAuth.title')}</Text>
          <Text style={styles.subtitle}>
            {t('phoneAuth.subtitle')}
          </Text>

          <View style={styles.card}>
            <View>
              <Text style={styles.label}>{t('phoneAuth.phoneNumberLabel')}</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable
                  style={[styles.input, { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12 }]}
                  onPress={() => setShowCountryPicker(true)}
                >
                  <Text style={{ fontSize: 18 }}>{country.flag}</Text>
                  <Text style={{ color: '#F8FAFC', fontSize: 16 }}>{country.dialCode}</Text>
                </Pressable>
                <TextInput
                  style={[styles.input, { flex: 1 }, error ? styles.inputError : null]}
                  placeholder="555 123 4567"
                  placeholderTextColor="#64748B"
                  value={localNumber}
                  onChangeText={setLocalNumber}
                  keyboardType="phone-pad"
                  textContentType="telephoneNumber"
                  autoComplete="tel"
                />
              </View>
              <Text style={styles.hint}>
                {t('phoneAuth.hint')}
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
                <Text style={styles.primaryButtonText}>{t('phoneAuth.sendCode')}</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showCountryPicker} animationType="slide" onRequestClose={() => setShowCountryPicker(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A' }}>
          <ScrollView contentContainerStyle={{ padding: 24 }}>
            <Text style={[styles.title, { marginBottom: 16 }]}>{t('phoneAuth.selectCountry')}</Text>
            {COUNTRY_CODES.map((item) => (
              <Pressable
                key={item.id}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 }}
                onPress={() => {
                  setCountry(item);
                  setShowCountryPicker(false);
                }}
              >
                <Text style={{ fontSize: 22 }}>{item.flag}</Text>
                <Text style={{ color: '#F8FAFC', fontSize: 16, flex: 1 }}>{item.name}</Text>
                <Text style={{ color: '#94A3B8', fontSize: 16 }}>{item.dialCode}</Text>
              </Pressable>
            ))}
            <Pressable style={[styles.backLink, { marginTop: 8 }]} onPress={() => setShowCountryPicker(false)}>
              <Text style={styles.backLinkText}>{t('phoneAuth.close')}</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {Platform.OS !== 'web' ? (
        <Modal visible={showRecaptcha} transparent animationType="fade" onRequestClose={() => setShowRecaptcha(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(15,23,42,0.85)', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 320, height: 420, borderRadius: 16, overflow: 'hidden', backgroundColor: '#1E293B' }}>
              <WebView
                ref={webViewRef}
                source={{ uri: RECAPTCHA_PAGE_URL }}
                onMessage={handleWebViewMessage}
              />
            </View>
            <Pressable style={{ marginTop: 16 }} onPress={() => setShowRecaptcha(false)}>
              <Text style={{ color: '#94A3B8', fontSize: 15 }}>{t('phoneAuth.cancel')}</Text>
            </Pressable>
          </View>
        </Modal>
      ) : null}
    </SafeAreaView>
  );
}
