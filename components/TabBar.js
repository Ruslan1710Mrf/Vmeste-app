import { Pressable, StyleSheet, Text, View } from 'react-native';

const TABS = [
  { id: 'home', label: 'Главная', emoji: '🏠' },
  { id: 'jobs', label: 'Работа', emoji: '💼' },
  { id: 'immigration', label: 'Иммиграция', emoji: '🌍' },
  { id: 'networking', label: 'Нетворкинг', emoji: '🤝' },
  { id: 'profile', label: 'Профиль', emoji: '👤' },
];

export default function TabBar({ active, onChange }) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <Pressable
            key={tab.id}
            style={({ pressed }) => [
              styles.tab,
              isActive && styles.tabActive,
              pressed && styles.tabPressed,
            ]}
            onPress={() => onChange(tab.id)}
          >
            <Text style={styles.emoji}>{tab.emoji}</Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: '#F1F5F9',
  },
  tabPressed: {
    opacity: 0.7,
  },
  emoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: '#94A3B8',
  },
  labelActive: {
    color: '#1E293B',
    fontWeight: '600',
  },
});
