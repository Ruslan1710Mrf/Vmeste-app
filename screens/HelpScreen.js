import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const SUPPORT_EMAIL = 'support@vmeste.app';

const FAQ = [
  {
    q: 'Как найти работу в США?',
    a: 'Используйте раздел «Работа» — там вакансии от компаний, открытых к кандидатам из СНГ. Обновляйте LinkedIn и готовьте резюме в американском формате.',
  },
  {
    q: 'Где получить помощь с визой?',
    a: 'Раздел «Иммиграция» содержит информацию о типах виз и ссылки на официальные ресурсы USCIS. Для сложных случаев рекомендуем accredited immigration attorney.',
  },
  {
    q: 'Как познакомиться с соотечественниками?',
    a: 'В «Нетворкинге» есть события, группы в Telegram/Discord и профили участников. Посещайте офлайн-встречи — это лучший способ завести связи.',
  },
  {
    q: 'Безопасно ли делиться данными в приложении?',
    a: 'Мы не передаём ваши данные третьим лицам. Не публикуйте номера документов и финансовую информацию в открытых разделах.',
  },
  {
    q: 'Как связаться с поддержкой?',
    a: 'Напишите нам на support@vmeste.app — отвечаем на русском и английском в течение 24 часов.',
  },
];

function FaqItem({ item }) {
  return (
    <View style={styles.faqItem}>
      <Text style={styles.question}>{item.q}</Text>
      <Text style={styles.answer}>{item.a}</Text>
    </View>
  );
}

export default function HelpScreen({ onBack }) {
  const openEmail = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}
          onPress={onBack}
        >
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backLabel}>Профиль</Text>
        </Pressable>
        <Text style={styles.screenTitle}>Помощь и поддержка</Text>
        <Text style={styles.screenSubtitle}>Частые вопросы о Vmeste</Text>
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
          <Text style={styles.contactTitle}>Не нашли ответ?</Text>
          <Text style={styles.contactText}>{SUPPORT_EMAIL}</Text>
          <Text style={styles.contactHint}>Нажмите, чтобы написать</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  backIcon: { fontSize: 20, color: '#EA580C', marginRight: 4 },
  backLabel: { fontSize: 16, fontWeight: '500', color: '#EA580C' },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  screenSubtitle: { fontSize: 15, color: '#64748B' },
  list: { paddingHorizontal: 24, paddingBottom: 16, gap: 16 },
  card: {
    backgroundColor: '#FFFFFF',
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
    color: '#1E293B',
    marginBottom: 8,
    lineHeight: 22,
  },
  answer: { fontSize: 14, lineHeight: 21, color: '#64748B' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 18 },
  contactCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  contactPressed: { opacity: 0.85 },
  contactTitle: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginBottom: 6 },
  contactText: { fontSize: 15, color: '#EA580C', fontWeight: '500' },
  contactHint: { fontSize: 13, color: '#94A3B8', marginTop: 6 },
});
