import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
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
import { statusCodes } from '@react-native-google-signin/google-signin';
import { mapAuthError, signInWithApple, signInWithEmail, signInWithGoogle } from '../../lib/authService';
import { useI18n } from '../../lib/i18n';
import styles from './authStyles';
import PasswordField from './PasswordField';

export default function LoginScreen() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const busy = loading || googleLoading || appleLoading;

  useEffect(() => {
    if (Platform.OS === 'ios') {
      AppleAuthentication.isAvailableAsync()
        .then(setAppleAvailable)
        .catch(() => {});
    }
  }, []);

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError(t('auth.errors.fillEmailPassword'));
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code?.startsWith('auth/')) {
        setError(t(mapAuthError(error.code)));
      } else if (error.message) {
        setError(error.message);
      } else {
        setError(t('auth.errors.generic'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setError('');
    setAppleLoading(true);
    try {
      await signInWithApple();
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      if (e.code === 'ERR_REQUEST_CANCELED') return;
      setError(t(mapAuthError(e.code ?? '')));
    } finally {
      setAppleLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === statusCodes.SIGN_IN_CANCELLED) return;
      if (error.code?.startsWith('auth/')) {
        setError(t(mapAuthError(error.code)));
      } else if (error.message) {
        setError(error.message);
      } else {
        setError(t('auth.errors.googleGeneric'));
      }
    } finally {
      setGoogleLoading(false);
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
          <Text style={styles.brand}>Vmeste</Text>
          <Text style={styles.tagline}>
            {t('auth.tagline.login')}
          </Text>

          <Text style={styles.title}>{t('auth.login.title')}</Text>
          <Text style={styles.subtitle}>
            {t('auth.login.subtitle')}
          </Text>

          <View style={styles.card}>
            <View>
              <Text style={styles.label}>{t('auth.emailLabel')}</Text>
              <TextInput
                style={[styles.input, error ? styles.inputError : null]}
                placeholder="you@example.com"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
              />
            </View>

            <PasswordField
              label={t('auth.passwordLabel')}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              hasError={Boolean(error)}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                busy && styles.primaryButtonDisabled,
                pressed && !busy && styles.primaryButtonPressed,
              ]}
              onPress={handleLogin}
              disabled={busy}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>{t('auth.login.submit')}</Text>
              )}
            </Pressable>

            {Platform.OS === 'web' ? (
              <Link href="/auth/phone" asChild>
                <Pressable
                  style={({ pressed }) => pressed && styles.pressed}
                  disabled={busy}
                >
                  <Text style={styles.phoneButton}>{t('auth.login.phoneButton')}</Text>
                </Pressable>
              </Link>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.googleButton,
                busy && styles.googleButtonDisabled,
                pressed && !busy && styles.googleButtonPressed,
              ]}
              onPress={handleGoogleLogin}
              disabled={busy}
            >
              {googleLoading ? (
                <ActivityIndicator color="#1E293B" />
              ) : (
                <Text style={styles.googleButtonText}>{t('auth.login.googleButton')}</Text>
              )}
            </Pressable>

            {appleAvailable && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={8}
                style={{ height: 48, opacity: busy ? 0.6 : 1 }}
                onPress={() => { if (!busy) handleAppleLogin(); }}
              />
            )}
          </View>

          <View style={styles.footer}>
            <Link href="/auth/forgot-password" asChild>
              <Pressable style={({ pressed }) => pressed && styles.linkPressed}>
                <Text style={styles.linkText}>{t('auth.login.forgotPassword')}</Text>
              </Pressable>
            </Link>
            <Link href="/auth/register" asChild>
              <Pressable style={({ pressed }) => pressed && styles.linkPressed}>
                <Text style={styles.linkText}>{t('auth.login.noAccount')}</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
