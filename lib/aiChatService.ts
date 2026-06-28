import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firestore';

export { AI_SYSTEM_PROMPT } from './aiSystemPrompt';

export type AiChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

type AiChatMessageDoc = Omit<AiChatMessage, 'id'>;

function messagesCollection(userId: string) {
  return collection(db, 'aiChats', userId, 'messages');
}

export async function fetchAiChatMessages(userId: string): Promise<AiChatMessage[]> {
  const messagesQuery = query(
    messagesCollection(userId),
    orderBy('createdAt', 'asc'),
    limit(200),
  );
  const snapshot = await getDocs(messagesQuery);
  return snapshot.docs.map((entry) => ({
    id: entry.id,
    ...(entry.data() as AiChatMessageDoc),
  }));
}

export async function saveAiChatMessage(
  userId: string,
  message: AiChatMessageDoc,
): Promise<AiChatMessage> {
  const ref = doc(messagesCollection(userId));
  await setDoc(ref, message);
  return { id: ref.id, ...message };
}

export async function deleteUserAiChats(userId: string): Promise<void> {
  const messagesQuery = query(messagesCollection(userId));
  const snapshot = await getDocs(messagesQuery);
  const batch = writeBatch(db);
  snapshot.docs.forEach((messageDoc) => {
    batch.delete(messageDoc.ref);
  });
  await batch.commit();
}
