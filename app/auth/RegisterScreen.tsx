import { Link, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
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
import { mapAuthError, registerWithEmail } from '../../lib/authService';
import { useI18n } from '../../lib/i18n';
import styles from './authStyles';
import PasswordField from './PasswordField';

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const handleRegister = async () => {
    setError('');
    if (!name.trim() || !lastName.trim() || !email.trim() || !password || !confirmPassword) {
      setError(t('auth.errors.fillAllFields'));
      return;
    }
    if (password.length < 6) {
      setError(t('auth.errors.passwordTooShort'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth.errors.passwordMismatch'));
      return;
    }
    setLoading(true);
    try {
      await registerWithEmail(email, password, `${name.trim()} ${lastName.trim()}`);
      router.replace('/auth/check-email');
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
          <Text style={styles.tagline}>{t('auth.tagline.register')}</Text>

          <Text style={styles.title}>{t('auth.register.title')}</Text>
          <Text style={styles.subtitle}>
            {t('auth.register.subtitle')}
          </Text>

          <View style={styles.card}>
            <View>
              <Text style={styles.label}>{t('auth.register.firstName')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('auth.register.firstNamePlaceholder')}
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                textContentType="givenName"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => lastNameRef.current?.focus()}
              />
            </View>

            <View>
              <Text style={styles.label}>{t('auth.register.lastName')}</Text>
              <TextInput
                ref={lastNameRef}
                style={styles.input}
                placeholder={t('auth.register.lastNamePlaceholder')}
                placeholderTextColor="#94A3B8"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                textContentType="familyName"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => emailRef.current?.focus()}
              />
            </View>

            <View>
              <Text style={styles.label}>{t('auth.emailLabel')}</Text>
              <TextInput
                ref={emailRef}
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>

            <PasswordField
              ref={passwordRef}
              label={t('auth.register.password')}
              placeholder={t('auth.register.passwordPlaceholder')}
              value={password}
              onChangeText={setPassword}
              textContentType="newPassword"
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
            />

            <PasswordField
              ref={confirmPasswordRef}
              label={t('auth.register.confirmPassword')}
              placeholder={t('auth.register.confirmPasswordPlaceholder')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              textContentType="newPassword"
              returnKeyType="done"
              blurOnSubmit
              onSubmitEditing={() => {
                if (!loading) void handleRegister();
              }}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                loading && styles.primaryButtonDisabled,
                pressed && !loading && styles.primaryButtonPressed,
              ]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>{t('auth.register.submit')}</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Link href="/auth/login" asChild>
              <Pressable style={({ pressed }) => pressed && styles.linkPressed}>
                <Text style={styles.linkText}>{t('auth.register.haveAccount')}</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
