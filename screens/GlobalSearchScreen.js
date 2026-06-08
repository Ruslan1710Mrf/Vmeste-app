import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { EVENTS } from '../data/events';
import { IMMIGRATION_SECTIONS } from '../data/immigration';
import { JOBS } from '../data/jobs';
import { MEMBERS } from '../data/members';

function ResultSection({ title, count, children }) {
  if (!count) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function ResultRow({ emoji, title, subtitle, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
    >
      <Text style={styles.rowEmoji}>{emoji}</Text>
      <View style={styles.rowContent}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      <Text style={styles.rowArrow}>›</Text>
    </Pressable>
  );
}

export default function GlobalSearchScreen({
  posts,
  onBack,
  onOpenJob,
  onOpenEvent,
  onOpenPost,
  onOpenGuide,
  onOpenMember,
}) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) return { jobs: [], events: [], posts: [], guides: [], members: [] };

    const jobs = JOBS.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.city.toLowerCase().includes(q),
    );

    const events = EVENTS.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q),
    );

    const matchedPosts = posts.filter(
      (p) =>
        p.content.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );

    const guides = [];
    IMMIGRATION_SECTIONS.forEach((section) => {
      if (section.id === 'links') return;
      section.items.forEach((item) => {
        if (
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
        ) {
          guides.push({ section, item });
        }
      });
    });

    const members = MEMBERS.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.city.toLowerCase().includes(q),
    );

    return { jobs, events, posts: matchedPosts, guides, members };
  }, [q, posts]);

  const total =
    results.jobs.length +
    results.events.length +
    results.posts.length +
    results.guides.length +
    results.members.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}
          onPress={onBack}
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <TextInput
          style={styles.input}
          placeholder="Поиск по всему приложению..."
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {q.length === 0 ? (
          <Text style={styles.hint}>Введите запрос — вакансии, события, посты, визы, люди</Text>
        ) : total === 0 ? (
          <Text style={styles.empty}>Ничего не найдено по запросу «{query}»</Text>
        ) : (
          <>
            <Text style={styles.count}>{total} результатов</Text>

            <ResultSection title="Работа" count={results.jobs.length}>
              {results.jobs.map((job) => (
                <ResultRow
                  key={job.id}
                  emoji="💼"
                  title={job.title}
                  subtitle={`${job.company} · ${job.city}`}
                  onPress={() => onOpenJob(job.id)}
                />
              ))}
            </ResultSection>

            <ResultSection title="События" count={results.events.length}>
              {results.events.map((event) => (
                <ResultRow
                  key={event.id}
                  emoji="📅"
                  title={event.title}
                  subtitle={`${event.city} · ${event.date}`}
                  onPress={() => onOpenEvent(event.id)}
                />
              ))}
            </ResultSection>

            <ResultSection title="Посты" count={results.posts.length}>
              {results.posts.map((post) => (
                <ResultRow
                  key={post.id}
                  emoji="📝"
                  title={post.author}
                  subtitle={post.content.slice(0, 80)}
                  onPress={() => onOpenPost(post.id)}
                />
              ))}
            </ResultSection>

            <ResultSection title="Иммиграция" count={results.guides.length}>
              {results.guides.map(({ section, item }) => (
                <ResultRow
                  key={`${section.id}-${item.title}`}
                  emoji={section.emoji}
                  title={item.title}
                  subtitle={section.title}
                  onPress={() => onOpenGuide(section, item)}
                />
              ))}
            </ResultSection>

            <ResultSection title="Люди" count={results.members.length}>
              {results.members.map((member) => (
                <ResultRow
                  key={member.id}
                  emoji="👤"
                  title={member.name}
                  subtitle={`${member.role} · ${member.city}`}
                  onPress={() => onOpenMember(member.id)}
                />
              ))}
            </ResultSection>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 8,
  },
  backButton: { padding: 8 },
  backPressed: { opacity: 0.6 },
  backIcon: { fontSize: 22, color: '#2563EB' },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  list: { paddingHorizontal: 24, paddingBottom: 24 },
  hint: { fontSize: 15, color: '#94A3B8', textAlign: 'center', marginTop: 40 },
  empty: { fontSize: 15, color: '#94A3B8', textAlign: 'center', marginTop: 40 },
  count: { fontSize: 14, color: '#64748B', marginBottom: 16 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  rowPressed: { opacity: 0.9 },
  rowEmoji: { fontSize: 22, marginRight: 12 },
  rowContent: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  rowSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  rowArrow: { fontSize: 20, color: '#CBD5E1', marginLeft: 8 },
});
