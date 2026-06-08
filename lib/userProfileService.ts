import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  type Timestamp,
} from 'firebase/firestore';
import { db } from './firestore';

export type UserProfileDoc = {
  uid: string;
  name: string;
  email: string;
  city: string;
  interests: string[];
  createdAt: Timestamp;
};

export type UserProfileInput = {
  uid: string;
  name: string;
  email: string;
  city: string;
  interests: string[];
};

export type UserProfileUpdate = Partial<
  Pick<UserProfileDoc, 'name' | 'email' | 'city' | 'interests'>
>;

function profileRef(uid: string) {
  return doc(db, 'users', uid);
}

export async function createUserProfile(uid: string, profile: UserProfileInput) {
  await setDoc(profileRef(uid), {
    uid,
    name: profile.name.trim(),
    email: profile.email.trim(),
    city: profile.city.trim(),
    interests: profile.interests ?? [],
    createdAt: serverTimestamp(),
  });
}

export async function fetchUserProfile(uid: string): Promise<UserProfileDoc | null> {
  const snap = await getDoc(profileRef(uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfileDoc;
}

export async function updateUserProfile(uid: string, partial: UserProfileUpdate) {
  const payload: UserProfileUpdate = {};
  if (partial.name != null) payload.name = partial.name.trim();
  if (partial.email != null) payload.email = partial.email.trim();
  if (partial.city != null) payload.city = partial.city.trim();
  if (partial.interests != null) payload.interests = partial.interests;
  await setDoc(profileRef(uid), payload, { merge: true });
}

export function mapProfileError(code: string): string {
  const messages: Record<string, string> = {
    'permission-denied': 'Нет доступа к профилю. Проверьте правила Firestore',
    'unavailable': 'Firestore недоступен. Проверьте подключение к интернету',
    'not-found': 'Профиль не найден',
  };
  return messages[code] ?? 'Не удалось загрузить профиль. Попробуйте позже';
}
