import { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { localize, useI18n } from '../lib/i18n';
import { useTheme } from '../lib/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ImmigrationGuideScreen({ section, item, onBack }) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { t, language } = useI18n();
  const steps = localize(item.steps, language) ?? [];
  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: 8 + insets.top }]}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}
          onPress={onBack}
        >
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backLabel}>{t('immigrationGuide.backLabel')}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.badge, { backgroundColor: `${section.color}18` }]}>
          <Text style={[styles.badgeText, { color: section.color }]}>
            {section.emoji} {localize(section.title, language)}
          </Text>
        </View>
        <Text style={styles.title}>{localize(item.title, language)}</Text>
        <Text style={styles.description}>{localize(item.description, language)}</Text>

        {steps.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{t('immigrationGuide.stepByStep')}</Text>
            {steps.map((step, i) => (
              <View key={step} style={styles.stepRow}>
                <View style={[styles.stepNum, { backgroundColor: `${section.color}18` }]}>
                  <Text style={[styles.stepNumText, { color: section.color }]}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </>
        )}

        {item.tip && (
          <View style={[styles.tipBox, { borderLeftColor: section.color }]}>
            <Text style={styles.tipLabel}>{t('immigrationGuide.tipLabel')}</Text>
            <Text style={styles.tipText}>{localize(item.tip, language)}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function useStyles() {
  const { colors } = useTheme();
  return useMemo(() => createStyles(colors), [colors]);
}

function createStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 8 },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingVertical: 6,
      paddingRight: 12,
    },
    backPressed: { opacity: 0.6 },
    backIcon: { fontSize: 20, color: '#059669', marginRight: 4 },
    backLabel: { fontSize: 16, fontWeight: '500', color: '#059669' },
    content: { paddingHorizontal: 24, paddingBottom: 32 },
    badge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      marginBottom: 16,
    },
    badgeText: { fontSize: 14, fontWeight: '600' },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.5,
      marginBottom: 12,
    },
    description: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.textSecondary,
      marginBottom: 28,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    stepRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 14,
    },
    stepNum: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      marginTop: 1,
    },
    stepNumText: { fontSize: 14, fontWeight: '700' },
    stepText: {
      flex: 1,
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSecondary,
    },
    tipBox: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderLeftWidth: 4,
      padding: 16,
      marginTop: 12,
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    },
    tipLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 6,
    },
    tipText: { fontSize: 14, lineHeight: 21, color: colors.textSecondary },
  });
}
