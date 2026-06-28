import { addDoc, collection } from 'firebase/firestore';
import { db } from './firestore';

export async function reportContent(
  reporterId: string,
  targetType: 'post' | 'user',
  targetId: string,
  reason: string = '',
): Promise<void> {
  await addDoc(collection(db, 'reports'), {
    reporterId,
    targetType,
    targetId,
    reason,
    createdAt: new Date().toISOString(),
  });
}
