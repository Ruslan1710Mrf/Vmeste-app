import OverviewBack from '../components/OverviewBack';
import { useMemo, useState } from 'react';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RESOURCE_CATEGORIES, RESOURCES } from '../data/resources';
import { localize, useI18n } from '../lib/i18n';
import { useTheme } from '../lib/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function ServiceIcon({ item }) {
  const styles = useStyles();
  const [iconFailed, setIconFailed] = useState(false);

  return (
    <View
      style={[
        styles.serviceIcon,
        { backgroundColor: iconFailed ? item.brandColor : '#F8FAFC' },
      ]}
    >
      {!iconFailed ? (
        <Image
          source={{ uri: item.icon }}
          style={styles.serviceIconImage}
          resizeMode="cover"
          onError={() => setIconFailed(true)}
        />
      ) : (
        <Text style={styles.serviceIconFallback}>{item.fallback}</Text>
      )}
    </View>
  );
}

function ResourceCard({ item }) {
  const styles = useStyles();
  const { t, language } = useI18n();
  const openUrl = () => {
    Linking.openURL(item.url).catch(() => {});
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <ServiceIcon item={item} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardDescription}>{localize(item.description, language)}</Text>
        </View>
      </View>
      <Pressable
        style={({ pressed }) => [styles.cardButton, pressed && styles.cardButtonPressed]}
        onPress={openUrl}
      >
        <Text style={styles.cardButtonText}>{t('resources.goTo')}</Text>
      </Pressable>
    </View>
  );
}

export default function ResourcesScreen({ onBack }) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { t, language } = useI18n();
  const [activeCategory, setActiveCategory] = useState(RESOURCE_CATEGORIES[0].id);

  const items = useMemo(
    () => RESOURCES[activeCategory] ?? [],
    [activeCategory],
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: 8 + insets.top }]}><OverviewBack onPress={onBack} />
        <Text style={styles.screenTitle}>{t('resources.title')}</Text>
        <Text style={styles.screenSubtitle}>
          {t('resources.subtitle')}
        </Text>
      </View>

      <View style={styles.tabsRow}>
        {RESOURCE_CATEGORIES.map((category) => {
          const selected = activeCategory === category.id;
          return (
            <Pressable
              key={category.id}
              style={[styles.tabChip, selected && styles.tabChipActive]}
              onPress={() => setActiveCategory(category.id)}
            >
              <Text
                style={[styles.tabChipText, selected && styles.tabChipTextActive]}
                numberOfLines={1}
              >
                {localize(category.label, language)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {items.map((item) => (
          <ResourceCard key={item.id} item={item} />
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
    container: {
      backgroundColor: colors.background,
      flex: 1,
    },
    header: {
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 12,
    },
    screenTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.5,
      marginBottom: 6,
    },
    screenSubtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 22,
    },
    tabsRow: {
      flexDirection: 'row',
      paddingHorizontal: 24,
      paddingBottom: 16,
      gap: 8,
    },
    tabChip: {
      flex: 1,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    tabChipActive: {
      backgroundColor: colors.accentSoft,
    },
    tabChipText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      textAlign: 'center',
    },
    tabChipTextActive: {
      color: colors.tabActive,
    },
    list: {
      paddingHorizontal: 24,
      paddingBottom: 24,
      gap: 12,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    cardTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 14,
    },
    serviceIcon: {
      width: 56,
      height: 56,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
      overflow: 'hidden',
    },
    serviceIconImage: {
      width: 56,
      height: 56,
    },
    serviceIconFallback: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    cardContent: {
      flex: 1,
      paddingTop: 2,
    },
    cardTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 6,
    },
    cardDescription: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
    },
    cardButton: {
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
    },
    cardButtonPressed: {
      opacity: 0.9,
    },
    cardButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });
}
