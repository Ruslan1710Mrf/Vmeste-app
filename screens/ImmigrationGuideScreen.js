import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function ImmigrationGuideScreen({ section, item, onBack }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}
          onPress={onBack}
        >
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backLabel}>Иммиграция</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.badge, { backgroundColor: `${section.color}18` }]}>
          <Text style={[styles.badgeText, { color: section.color }]}>
            {section.emoji} {section.title}
          </Text>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>

        {item.steps?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Пошагово</Text>
            {item.steps.map((step, i) => (
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
            <Text style={styles.tipLabel}>💡 Совет</Text>
            <Text style={styles.tipText}>{item.tip}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#475569',
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
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
    color: '#475569',
  },
  tipBox: {
    backgroundColor: '#FFFFFF',
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
    color: '#1E293B',
    marginBottom: 6,
  },
  tipText: { fontSize: 14, lineHeight: 21, color: '#64748B' },
});
