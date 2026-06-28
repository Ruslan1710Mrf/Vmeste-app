import '../lib/firebase';
import { Stack, useRouter, useSegments } from 'expo-router';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { clearSignedOutFlag, shouldRequireLogin } from '../lib/authService';
import { auth } from '../lib/firebase';
import { ThemeProvider } from '../lib/ThemeContext';
import { I18nProvider } from '../lib/i18n';

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (initializing) return;

    const segmentList = segments as string[];
    const inAuthGroup = segmentList[0] === 'auth';
    const onCheckEmail = segmentList[0] === 'auth' && segmentList[1] === 'check-email';
    const needsEmailVerification =
      user?.providerData.some((provider) => provider.providerId === 'password')
      && !user.emailVerified;

    if (!user) {
      if (!inAuthGroup && shouldRequireLogin()) {
        router.replace('/auth/login');
      }
      return;
    }

    clearSignedOutFlag();

    if (needsEmailVerification) {
      if (!onCheckEmail) {
        router.replace('/auth/check-email');
      }
      return;
    }

    if (inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, segments, initializing, router]);

  if (initializing) {
    return (
      <SafeAreaProvider>
        <ThemeProvider>
          <I18nProvider>
            <View style={styles.loading}>
              <ActivityIndicator size="large" color="#2563EB" />
            </View>
          </I18nProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <I18nProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </I18nProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
});
