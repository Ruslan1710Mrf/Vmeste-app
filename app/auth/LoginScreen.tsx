import { Link } from 'expo-router';
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
import { mapAuthError, signInWithEmail } from '../../lib/authService';
import { authStyles as styles } from './authStyles';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Заполните email и пароль');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code?.startsWith('auth/')) {
        setError(mapAuthError(error.code));
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Произошла ошибка. Попробуйте снова');
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
          <Text style={styles.tagline}>
            Сообщество для соотечественников в США
          </Text>

          <Text style={styles.title}>Вход</Text>
          <Text style={styles.subtitle}>
            Войдите — мы загрузим ваш профиль из базы данных
          </Text>

          <View style={styles.card}>
            <View>
              <Text style={styles.label}>Email</Text>
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

            <View>
              <Text style={styles.label}>Пароль</Text>
              <TextInput
                style={[styles.input, error ? styles.inputError : null]}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textContentType="password"
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                loading && styles.primaryButtonDisabled,
                pressed && !loading && styles.primaryButtonPressed,
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Войти</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Link href="/auth/forgot-password" asChild>
              <Pressable style={({ pressed }) => pressed && styles.linkPressed}>
                <Text style={styles.linkText}>Забыли пароль?</Text>
              </Pressable>
            </Link>
            <Link href="/auth/register" asChild>
              <Pressable style={({ pressed }) => pressed && styles.linkPressed}>
                <Text style={styles.linkText}>Нет аккаунта? Зарегистрироваться</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
