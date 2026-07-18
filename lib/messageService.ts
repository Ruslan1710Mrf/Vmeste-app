import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

// Conversation ID — всегда одинаковый для двух юзеров
export function getConversationId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join('_');
}

// Создать или открыть conversation doc
export async function ensureConversation(
  myUid: string,
  otherUid: string,
  otherName: string,
  myName: string,
): Promise<string> {
  const convId = getConversationId(myUid, otherUid);
  const ref = doc(db, 'conversations', convId);

  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      participants: [myUid, otherUid].sort(),
      participantNames: { [myUid]: myName, [otherUid]: otherName },
      lastMessage: '',
      lastMessageAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
  } else {
    await updateDoc(ref, {
      participantNames: { [myUid]: myName, [otherUid]: otherName },
    });
  }

  return convId;
}

// Отправить сообщение
export async function sendMessage(
  convId: string,
  fromUid: string,
  text: string,
): Promise<void> {
  const messagesRef = collection(db, 'conversations', convId, 'messages');
  await addDoc(messagesRef, {
    fromUid,
    text: text.trim(),
    createdAt: serverTimestamp(),
  });

  // Обновить preview в conversation
  const convRef = doc(db, 'conversations', convId);
  await updateDoc(convRef, {
    lastMessage: text.trim(),
    lastMessageAt: serverTimestamp(),
  });
}

// Слушать сообщения в реальном времени
export function subscribeToMessages(
  convId: string,
  callback: (messages: Message[]) => void,
): () => void {
  const q = query(
    collection(db, 'conversations', convId, 'messages'),
    orderBy('createdAt', 'asc'),
  );

  return onSnapshot(
    q,
    (snap) => {
      const messages: Message[] = snap.docs.map((d) => ({
        id: d.id,
        fromUid: d.data().fromUid,
        text: d.data().text,
        createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      }));
      callback(messages);
    },
    (error) => {
      console.error('[subscribeToMessages] snapshot error', error);
      callback([]);
    },
  );
}

// Слушать все conversations текущего юзера
export function subscribeToConversations(
  uid: string,
  callback: (convs: Conversation[]) => void,
): () => void {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', uid),
  );

  return onSnapshot(q, (snap) => {
    const convs: Conversation[] = snap.docs
      .map((d) => ({
        id: d.id,
        participants: d.data().participants,
        participantNames: d.data().participantNames ?? {},
        lastMessage: d.data().lastMessage ?? '',
        lastMessageAt: d.data().lastMessageAt?.toDate?.()?.toISOString() ?? '',
      }))
      .sort((a, b) => (b.lastMessageAt > a.lastMessageAt ? 1 : -1));
    callback(convs);
  });
}

export async function deleteConversation(convId: string): Promise<void> {
  const messagesSnap = await getDocs(collection(db, 'conversations', convId, 'messages'));
  const batch = writeBatch(db);
  messagesSnap.docs.forEach((messageDoc) => batch.delete(messageDoc.ref));
  batch.delete(doc(db, 'conversations', convId));
  await batch.commit();
}

export async function deleteUserConversations(uid: string): Promise<void> {
  const conversationsQuery = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', uid),
  );
  const conversationsSnap = await getDocs(conversationsQuery);

  for (const convDoc of conversationsSnap.docs) {
    const messagesSnap = await getDocs(collection(db, 'conversations', convDoc.id, 'messages'));
    const batch = writeBatch(db);
    messagesSnap.docs.forEach((messageDoc) => batch.delete(messageDoc.ref));
    batch.delete(convDoc.ref);
    await batch.commit();
  }
}

export interface Message {
  id: string;
  fromUid: string;
  text: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  lastMessage: string;
  lastMessageAt: string;
}
