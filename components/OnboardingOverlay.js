import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ONBOARDING_SLIDES } from '../data/onboarding';
import { useI18n } from '../lib/i18n';

const { width } = Dimensions.get('window');

export default function OnboardingOverlay({ onComplete }) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const listRef = useRef(null);
  const isLast = index === ONBOARDING_SLIDES.length - 1;

  const goNext = () => {
    if (isLast) {
      onComplete();
      return;
    }
    const next = index + 1;
    listRef.current?.scrollToIndex({ index: next, animated: true });
    setIndex(next);
  };

  return (
    <View style={styles.overlay}>
      <FlatList
        ref={listRef}
        data={ONBOARDING_SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(i);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {ONBOARDING_SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={goNext}
        >
          <Text style={styles.buttonText}>{isLast ? t('onboarding.start') : t('onboarding.next')}</Text>
        </Pressable>
        {!isLast && (
          <Pressable onPress={onComplete} style={styles.skip}>
            <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F1F5F9',
    zIndex: 100,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emoji: { fontSize: 72, marginBottom: 32 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 17,
    lineHeight: 26,
    color: '#64748B',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    alignItems: 'center',
  },
  dots: { flexDirection: 'row', gap: 8, marginBottom: 28 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  dotActive: { backgroundColor: '#2563EB', width: 24 },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 48,
    width: '100%',
    alignItems: 'center',
  },
  buttonPressed: { opacity: 0.9 },
  buttonText: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },
  skip: { marginTop: 16, padding: 8 },
  skipText: { fontSize: 15, color: '#94A3B8' },
});
