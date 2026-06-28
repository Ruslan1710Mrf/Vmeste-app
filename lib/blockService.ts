import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from './firestore';

function blockId(blockerId: string, blockedId: string): string {
  return `${blockerId}_${blockedId}`;
}

export async function blockUser(blockerId: string, blockedId: string): Promise<void> {
  await setDoc(doc(db, 'blocks', blockId(blockerId, blockedId)), {
    blockerId,
    blockedId,
    createdAt: serverTimestamp(),
  });
}

export async function unblockUser(blockerId: string, blockedId: string): Promise<void> {
  await deleteDoc(doc(db, 'blocks', blockId(blockerId, blockedId)));
}

export async function fetchBlockedByMe(uid: string): Promise<string[]> {
  const snap = await getDocs(query(collection(db, 'blocks'), where('blockerId', '==', uid)));
  return snap.docs.map((entry) => entry.data().blockedId as string);
}

export async function fetchBlockedMe(uid: string): Promise<string[]> {
  const snap = await getDocs(query(collection(db, 'blocks'), where('blockedId', '==', uid)));
  return snap.docs.map((entry) => entry.data().blockerId as string);
}
