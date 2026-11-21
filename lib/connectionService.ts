import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

// Друзья (связи) хранятся на сервере: users/{uid}/connections/{targetUid}.
// Односторонняя связь «я добавил этого человека» — как было локально, но
// теперь синхронизируется между устройствами и не теряется при переустановке.

const connectionsCol = (uid: string) => collection(db, 'users', uid, 'connections');
const connectionRef = (uid: string, targetUid: string) =>
  doc(db, 'users', uid, 'connections', targetUid);

export async function addConnection(myUid: string, targetUid: string): Promise<void> {
  if (!myUid || !targetUid || myUid === targetUid) return;
  await setDoc(connectionRef(myUid, targetUid), {
    uid: targetUid,
    createdAt: serverTimestamp(),
  });
}

export async function removeConnection(myUid: string, targetUid: string): Promise<void> {
  if (!myUid || !targetUid) return;
  await deleteDoc(connectionRef(myUid, targetUid));
}

/** Слушать свои связи в реальном времени. Возвращает функцию отписки. */
export function subscribeToConnections(
  myUid: string,
  callback: (ids: string[]) => void,
): () => void {
  return onSnapshot(
    connectionsCol(myUid),
    (snap) => callback(snap.docs.map((d) => d.id)),
    (error) => {
      // Не затираем локальный кэш друзей при временной ошибке/офлайне.
      console.warn('[subscribeToConnections] snapshot error', error);
    },
  );
}

/**
 * Разовый перенос локальных связей (из AsyncStorage) на сервер при первом
 * входе после обновления. Пишет только те, которых ещё нет.
 */
export async function migrateLocalConnections(myUid: string, ids: string[]): Promise<void> {
  if (!myUid || !ids?.length) return;
  try {
    const existing = new Set((await getDocs(connectionsCol(myUid))).docs.map((d) => d.id));
    const missing = ids.filter((id) => id && id !== myUid && !existing.has(id));
    for (let i = 0; i < missing.length; i += 400) {
      const batch = writeBatch(db);
      missing.slice(i, i + 400).forEach((id) => {
        batch.set(connectionRef(myUid, id), { uid: id, createdAt: serverTimestamp() });
      });
      await batch.commit();
    }
  } catch (error) {
    console.warn('[migrateLocalConnections] failed', error);
  }
}

/** Удаление аккаунта: стереть все свои связи. */
export async function deleteUserConnections(uid: string): Promise<void> {
  const snap = await getDocs(connectionsCol(uid));
  for (let i = 0; i < snap.docs.length; i += 400) {
    const batch = writeBatch(db);
    snap.docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}
