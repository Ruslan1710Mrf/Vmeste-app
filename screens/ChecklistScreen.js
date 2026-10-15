import { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CHECKLIST_ITEMS } from '../data/checklist';
import { useI18n } from '../lib/i18n';
import { useTheme } from '../lib/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function ChecklistItem({ item, checked, onToggle, onOpenGuide }) {
  const styles = useStyles();
  const { t } = useI18n();
  return (
    <View style={styles.row}>
      <Pressable
        style={({ pressed }) => [styles.checkboxWrap, pressed && styles.rowPressed]}
        onPress={() => onToggle(item.id)}
        hitSlop={8}
      >
        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
          {checked && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </Pressable>
      <View style={styles.content}>
        <Text style={[styles.title, checked && styles.titleChecked]}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.footer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          {item.guideLink ? (
            <Pressable
              style={({ pressed }) => [styles.guideLink, pressed && styles.guideLinkPressed]}
              onPress={() => onOpenGuide(item.guideLink)}
            >
              <Text style={styles.guideLinkText}>{t('checklist.readMore')}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export default function ChecklistScreen({ checkedIds, onBack, onToggle, onOpenGuide }) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const done = checkedIds.length;
  const total = CHECKLIST_ITEMS.length;
  const progress = Math.round((done / total) * 100);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: 16 + insets.top }]}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}
          onPress={onBack}
        >
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backLabel}>{t('checklist.backLabel')}</Text>
        </Pressable>
        <Text style={styles.screenTitle}>{t('checklist.title')}</Text>
        <Text style={styles.screenSubtitle}>
          {t('checklist.progress', { done, total, progress })}
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {CHECKLIST_ITEMS.map((item) => (
          <ChecklistItem
            key={item.id}
            item={item}
            checked={checkedIds.includes(item.id)}
            onToggle={onToggle}
            onOpenGuide={onOpenGuide}
          />
        ))}
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
    screenSubtitle: { fontSize: 15, color: colors.textSecondary, marginBottom: 12 },
    progressTrack: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#059669',
      borderRadius: 4,
    },
    list: { paddingHorizontal: 24, paddingBottom: 24, gap: 10 },
    row: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 16,
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    },
    rowPressed: { opacity: 0.7 },
    checkboxWrap: { marginRight: 14, marginTop: 2 },
    checkbox: {
      width: 26,
      height: 26,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      backgroundColor: '#059669',
      borderColor: '#059669',
    },
    checkmark: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
    content: { flex: 1 },
    title: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 },
    titleChecked: { textDecorationLine: 'line-through', color: colors.textMuted },
    description: { fontSize: 14, lineHeight: 20, color: colors.textSecondary, marginBottom: 8 },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 8,
    },
    categoryBadge: {
      backgroundColor: colors.surfaceMuted,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    categoryText: { fontSize: 11, fontWeight: '500', color: colors.textSecondary },
    guideLink: { paddingVertical: 2 },
    guideLinkPressed: { opacity: 0.6 },
    guideLinkText: { fontSize: 13, fontWeight: '600', color: '#059669' },
  });
}
