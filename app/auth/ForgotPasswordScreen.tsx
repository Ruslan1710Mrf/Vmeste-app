import { Link, useRouter } from 'expo-router';
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
import { mapAuthError, sendPasswordReset } from '../../lib/authService';
import { useI18n } from '../../lib/i18n';
import styles from './authStyles';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setError('');
    setSuccess('');
    if (!email.trim()) {
      setError(t('auth.errors.enterEmail'));
      return;
    }
    setLoading(true);
    try {
      await sendPasswordReset(email);
      setSuccess(t('auth.forgotPassword.successMessage'));
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      setError(t(mapAuthError(code)));
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
          <Link href="/auth/login" asChild>
            <Pressable style={styles.backLink}>
              <Text style={styles.backLinkText}>{t('auth.forgotPassword.backLink')}</Text>
            </Pressable>
          </Link>

          <Text style={styles.title}>{t('auth.forgotPassword.title')}</Text>
          <Text style={styles.subtitle}>
            {t('auth.forgotPassword.subtitle')}
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

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {success ? <Text style={styles.successText}>{success}</Text> : null}

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                loading && styles.primaryButtonDisabled,
                pressed && !loading && styles.primaryButtonPressed,
              ]}
              onPress={handleReset}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>{t('auth.forgotPassword.submit')}</Text>
              )}
            </Pressable>
          </View>

          {success ? (
            <View style={styles.footer}>
              <Pressable
                style={({ pressed }) => pressed && styles.linkPressed}
                onPress={() => router.replace('/auth/login')}
              >
                <Text style={styles.linkText}>{t('auth.forgotPassword.backToLogin')}</Text>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
