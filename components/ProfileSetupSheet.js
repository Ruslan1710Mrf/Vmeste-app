import { useTheme } from '../lib/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useI18n } from '../lib/i18n';

const INTEREST_OPTION_KEYS = [
  { tag: 'IT', key: 'profileSetup.interests.it' },
  { tag: 'Иммиграция', key: 'profileSetup.interests.immigration' },
  { tag: 'Предпринимательство', key: 'profileSetup.interests.entrepreneurship' },
  { tag: 'Нетворкинг', key: 'profileSetup.interests.networking' },
  { tag: 'Карьера', key: 'profileSetup.interests.career' },
  { tag: 'Жизнь в США', key: 'profileSetup.interests.lifeInUs' },
];

export default function ProfileSetupSheet({ profile, visible, onComplete }) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [city, setCity] = useState(profile.city ?? '');
  const [interests, setInterests] = useState(profile.interests ?? []);

  const toggleInterest = (tag) => {
    setInterests((prev) =>
      prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag],
    );
  };

  const handleSave = () => {
    const trimmedCity = city.trim();
    if (!trimmedCity) return;
    onComplete({
      ...profile,
      city: trimmedCity,
      interests,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{t('profileSetup.welcome')}</Text>
            <Text style={styles.subtitle}>
              {t('profileSetup.subtitle')}
            </Text>

            <Text style={styles.label}>{t('profileSetup.cityLabel')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('profileSetup.cityPlaceholder')}
              placeholderTextColor={colors.textMuted}
              value={city}
              onChangeText={setCity}
            />

            <Text style={styles.label}>{t('profileSetup.interestsLabel')}</Text>
            <View style={styles.chips}>
              {INTEREST_OPTION_KEYS.map(({ tag, key }) => {
                const active = interests.includes(tag);
                return (
                  <Pressable
                    key={tag}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => toggleInterest(tag)}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {t(key)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                !city.trim() && styles.buttonDisabled,
                pressed && city.trim() && styles.buttonPressed,
              ]}
              onPress={handleSave}
              disabled={!city.trim()}
            >
              <Text style={styles.buttonText}>{t('profileSetup.continueButton')}</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%', maxWidth: 560, alignSelf: 'center',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 36,
    maxHeight: '85%',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 28,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.accentSoft,
    borderColor: '#2563EB',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.tabActive,
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#93C5FD',
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
