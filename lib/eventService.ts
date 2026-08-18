import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firestore';

export type EventRecord = {
  id: string;
  authorId?: string;
  title: string;
  date: string;
  city: string;
  venue: string;
  description: string;
  host: string;
  attendees: number;
  agenda: string[];
  createdAt: string;
};

type EventDoc = Omit<EventRecord, 'id'>;

function mapEvent(id: string, data: EventDoc): EventRecord {
  return {
    id,
    authorId: data.authorId,
    title: data.title,
    date: data.date,
    city: data.city,
    venue: data.venue,
    description: data.description,
    host: data.host,
    attendees: data.attendees ?? 1,
    agenda: data.agenda ?? [],
    createdAt: data.createdAt,
  };
}

export async function fetchEvents(): Promise<EventRecord[]> {
  const eventsQuery = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(eventsQuery);
  return snapshot.docs.map((entry) => mapEvent(entry.id, entry.data() as EventDoc));
}

export async function deleteUserEvents(uid: string): Promise<void> {
  const q = query(collection(db, 'events'), where('authorId', '==', uid));
  const snap = await getDocs(q);
  if (snap.empty) return;
  const docs = snap.docs;
  for (let i = 0; i < docs.length; i += 500) {
    const batch = writeBatch(db);
    docs.slice(i, i + 500).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

export async function createEvent(
  uid: string,
  input: {
    title: string;
    date: string;
    city: string;
    venue: string;
    description: string;
    host: string;
  },
): Promise<EventRecord> {
  const ref = doc(collection(db, 'events'));
  const createdAt = new Date().toISOString();
  const payload: EventDoc = {
    authorId: uid,
    title: input.title,
    date: input.date,
    city: input.city,
    venue: input.venue,
    description: input.description,
    host: input.host,
    attendees: 1,
    agenda: [],
    createdAt,
  };
  await setDoc(ref, payload);
  return mapEvent(ref.id, payload);
}
