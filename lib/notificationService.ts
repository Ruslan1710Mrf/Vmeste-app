import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

// Лента «Уведомления»: users/{uid}/notifications. Документы создаёт только
// Cloud Function pushOnNewReply; клиент читает, отмечает прочитанными, удаляет.

export type AppNotification = {
  id: string;
  type: 'comment';
  postId: string;
  fromUid: string;
  fromName: string;
  text: string;
  read: boolean;
  createdAt: string;
};

const FEED_LIMIT = 50;

const feedRef = (uid: string) => collection(db, 'users', uid, 'notifications');

export function subscribeToNotifications(
  uid: string,
  callback: (items: AppNotification[]) => void,
): () => void {
  const q = query(feedRef(uid), orderBy('createdAt', 'desc'), limit(FEED_LIMIT));
  return onSnapshot(
    q,
    (snap) => {
      callback(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            type: data.type,
            postId: data.postId,
            fromUid: data.fromUid,
            fromName: data.fromName ?? '',
            text: data.text ?? '',
            read: data.read === true,
            createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
          };
        }),
      );
    },
    (error) => {
      console.error('[subscribeToNotifications] snapshot error', error);
      callback([]);
    },
  );
}

export async function markNotificationRead(uid: string, id: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'notifications', id), { read: true });
}

export async function markAllNotificationsRead(uid: string): Promise<void> {
  const snap = await getDocs(query(feedRef(uid), where('read', '==', false)));
  for (let i = 0; i < snap.docs.length; i += 500) {
    const batch = writeBatch(db);
    snap.docs.slice(i, i + 500).forEach((d) => batch.update(d.ref, { read: true }));
    await batch.commit();
  }
}

/** Удаление аккаунта: стираем ленту до документа профиля. */
export async function deleteUserNotifications(uid: string): Promise<void> {
  const snap = await getDocs(feedRef(uid));
  for (let i = 0; i < snap.docs.length; i += 500) {
    const batch = writeBatch(db);
    snap.docs.slice(i, i + 500).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}
