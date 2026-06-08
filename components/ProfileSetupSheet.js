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

const INTEREST_OPTIONS = [
  'IT',
  'Иммиграция',
  'Предпринимательство',
  'Нетворкинг',
  'Карьера',
  'Жизнь в США',
];

export default function ProfileSetupSheet({ profile, visible, onComplete }) {
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
        <View style={styles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Добро пожаловать в Vmeste!</Text>
            <Text style={styles.subtitle}>
              Расскажите немного о себе — так мы подберём полезные рекомендации
            </Text>

            <Text style={styles.label}>Город в США</Text>
            <TextInput
              style={styles.input}
              placeholder="Например: Бруклин, Нью-Йорк"
              placeholderTextColor="#94A3B8"
              value={city}
              onChangeText={setCity}
            />

            <Text style={styles.label}>Интересы</Text>
            <View style={styles.chips}>
              {INTEREST_OPTIONS.map((tag) => {
                const active = interests.includes(tag);
                return (
                  <Pressable
                    key={tag}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => toggleInterest(tag)}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {tag}
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
              <Text style={styles.buttonText}>Продолжить</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
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
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#64748B',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1E293B',
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
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  chipTextActive: {
    color: '#2563EB',
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
