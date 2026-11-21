import { useMemo } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useI18n } from '../lib/i18n';
import { useTheme } from '../lib/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SUPPORT_EMAIL = 'support@vmestegroup.app';

function useFaq() {
  const { t } = useI18n();
  return [
    { q: t('help.faq1.q'), a: t('help.faq1.a') },
    { q: t('help.faq2.q'), a: t('help.faq2.a') },
    { q: t('help.faq3.q'), a: t('help.faq3.a') },
    { q: t('help.faq4.q'), a: t('help.faq4.a') },
    { q: t('help.faq5.q'), a: t('help.faq5.a') },
  ];
}

function FaqItem({ item }) {
  const styles = useStyles();
  return (
    <View style={styles.faqItem}>
      <Text style={styles.question}>{item.q}</Text>
      <Text style={styles.answer}>{item.a}</Text>
    </View>
  );
}

export default function HelpScreen({ onBack }) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const FAQ = useFaq();
  const openEmail = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: 16 + insets.top }]}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}
          onPress={onBack}
        >
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backLabel}>{t('help.backLabel')}</Text>
        </Pressable>
        <Text style={styles.screenTitle}>{t('help.title')}</Text>
        <Text style={styles.screenSubtitle}>{t('help.subtitle')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {FAQ.map((item, index) => (
            <View key={item.q}>
              <FaqItem item={item} />
              {index < FAQ.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [styles.contactCard, pressed && styles.contactPressed]}
          onPress={openEmail}
        >
          <Text style={styles.contactTitle}>{t('help.notFound')}</Text>
          <Text style={styles.contactText}>{SUPPORT_EMAIL}</Text>
          <Text style={styles.contactHint}>{t('help.tapToWrite')}</Text>
        </Pressable>
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
    header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      marginBottom: 16,
      paddingVertical: 6,
      paddingRight: 12,
    },
    backPressed: { opacity: 0.6 },
    backIcon: { fontSize: 20, color: colors.accent, marginRight: 4 },
    backLabel: { fontSize: 16, fontWeight: '500', color: colors.accent },
    screenTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.5,
      marginBottom: 6,
    },
    screenSubtitle: { fontSize: 15, color: colors.textSecondary },
    list: { paddingHorizontal: 24, paddingBottom: 16, gap: 16 },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 4,
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    faqItem: { padding: 18 },
    question: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
      lineHeight: 22,
    },
    answer: { fontSize: 14, lineHeight: 21, color: colors.textSecondary },
    divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 18 },
    contactCard: {
      backgroundColor: colors.accentSoft,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
    },
    contactPressed: { opacity: 0.85 },
    contactTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 6 },
    contactText: { fontSize: 15, color: colors.accent, fontWeight: '500' },
    contactHint: { fontSize: 13, color: colors.textMuted, marginTop: 6 },
  });
}
