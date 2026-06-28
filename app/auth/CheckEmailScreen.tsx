import { useRouter } from 'expo-router';
import { reload } from 'firebase/auth';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from '../../lib/authService';
import { auth } from '../../lib/firebase';
import { useI18n } from '../../lib/i18n';
import styles from './authStyles';

export default function CheckEmailScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const handleBack = async () => {
    await signOut();
    router.replace('/auth/login');
  };

  const handleContinue = async () => {
    setError('');
    const user = auth.currentUser;
    if (!user) {
      router.replace('/auth/login');
      return;
    }

    setChecking(true);
    try {
      await reload(user);
      if (user.emailVerified) {
        router.replace('/(tabs)');
        return;
      }
      setError(t('checkEmail.errors.notVerified'));
    } catch {
      setError(t('checkEmail.errors.checkFailed'));
    } finally {
      setChecking(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.backLink} onPress={handleBack}>
          <Text style={styles.backLinkText}>{t('checkEmail.backLink')}</Text>
        </Pressable>

        <Text style={styles.brand}>Vmeste</Text>
        <Text style={styles.title}>{t('checkEmail.title')}</Text>
        <Text style={styles.subtitle}>
          {t('checkEmail.subtitle')}
        </Text>

        <View style={styles.card}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              checking && styles.primaryButtonDisabled,
              pressed && !checking && styles.primaryButtonPressed,
            ]}
            onPress={handleContinue}
            disabled={checking}
          >
            {checking ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>{t('checkEmail.confirmedButton')}</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
