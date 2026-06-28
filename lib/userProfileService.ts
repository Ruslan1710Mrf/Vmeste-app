import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Timestamp,
} from 'firebase/firestore';
import { auth } from './firebase';
import { db } from './firestore';

export type UserProfileDoc = {
  uid: string;
  name: string;
  email?: string;
  city: string;
  interests: string[];
  photoUri?: string | null;
  coverPhoto?: string | null;
  createdAt: Timestamp;
};

export type StoryUser = {
  uid: string;
  name: string;
  photoUri: string | null;
};

export type MemberProfile = {
  id: string;
  name: string;
  role: string;
  city: string;
  country: string;
  bio: string;
  interests: string[];
  connectionIds: string[];
};

export function profileDocToMember(doc: UserProfileDoc): MemberProfile {
  return {
    id: doc.uid,
    name: doc.name?.trim() || 'Пользователь',
    role: doc.city?.trim() ? doc.city : 'Участник сообщества',
    city: doc.city?.trim() ?? '',
    country: '🇺🇸',
    bio: '',
    interests: doc.interests ?? [],
    connectionIds: [],
  };
}

export type UserProfileInput = {
  uid: string;
  name: string;
  email: string;
  city: string;
  interests: string[];
  photoUri?: string | null;
};

export type UserProfileUpdate = Partial<
  Pick<UserProfileDoc, 'name' | 'email' | 'city' | 'interests' | 'photoUri' | 'coverPhoto'>
>;

function profileRef(uid: string) {
  return doc(db, 'users', uid);
}

function privateContactRef(uid: string) {
  return doc(db, 'users', uid, 'private', 'contact');
}

export async function createUserProfile(uid: string, profile: UserProfileInput) {
  await setDoc(profileRef(uid), {
    uid,
    name: profile.name.trim(),
    city: profile.city.trim(),
    interests: profile.interests ?? [],
    createdAt: serverTimestamp(),
  });
  await setDoc(privateContactRef(uid), { email: profile.email.trim() });
}

export async function fetchUserProfile(uid: string): Promise<UserProfileDoc | null> {
  const snap = await getDoc(profileRef(uid));
  if (!snap.exists()) return null;
  const data = snap.data() as UserProfileDoc;

  // Older docs stored email inline on the public doc; migrate it to the
  // owner-only private doc the first time the owner loads their profile.
  if (auth.currentUser?.uid === uid && (data as { email?: string }).email) {
    try {
      await setDoc(privateContactRef(uid), { email: (data as { email?: string }).email }, { merge: true });
      await updateDoc(profileRef(uid), { email: deleteField() });
    } catch {
      // Best-effort; will retry on next load.
    }
  }

  try {
    const privateSnap = await getDoc(privateContactRef(uid));
    if (privateSnap.exists()) {
      data.email = (privateSnap.data() as { email?: string }).email ?? data.email ?? '';
    }
  } catch {
    // Permission denied when looking up another user's private contact info — expected.
  }

  return data;
}

export async function deleteUserProfile(uid: string): Promise<void> {
  await deleteDoc(profileRef(uid));
}

export async function fetchUsersByIds(uids: string[]): Promise<MemberProfile[]> {
  const uniqueIds = Array.from(new Set(uids.filter(Boolean)));
  if (!uniqueIds.length) return [];

  const docs = await Promise.all(
    uniqueIds.map((uid) => fetchUserProfile(uid).catch(() => null)),
  );

  return docs
    .filter((profileDoc): profileDoc is UserProfileDoc => Boolean(profileDoc))
    .map((profileDoc) => profileDocToMember(profileDoc));
}

export async function fetchRecentUsers(limitCount = 10): Promise<StoryUser[]> {
  const usersQuery = query(
    collection(db, 'users'),
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  );
  const snap = await getDocs(usersQuery);

  return snap.docs.map((userDoc) => {
    const data = userDoc.data();
    const name = typeof data.name === 'string' ? data.name.trim() : '';
    const photoUri =
      (typeof data.photoUri === 'string' && data.photoUri) ||
      (typeof data.photoURL === 'string' && data.photoURL) ||
      null;

    return {
      uid: typeof data.uid === 'string' ? data.uid : userDoc.id,
      name: name || 'Пользователь',
      photoUri,
    };
  });
}

export function memberMatchesQuery(member: MemberProfile, searchTerm: string): boolean {
  const term = searchTerm.trim().toLowerCase();
  if (!term) return false;

  return (
    member.name.toLowerCase().includes(term) ||
    member.role.toLowerCase().includes(term) ||
    member.city.toLowerCase().includes(term) ||
    member.interests.some((interest) => interest.toLowerCase().includes(term))
  );
}

export async function searchUsers(searchTerm: string): Promise<MemberProfile[]> {
  const term = searchTerm.trim().toLowerCase();
  if (!term) return [];

  const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(300));
  const snap = await getDocs(usersQuery);

  return snap.docs
    .map((userDoc) => {
      const data = userDoc.data() as UserProfileDoc;
      return profileDocToMember({
        ...data,
        uid: data.uid || userDoc.id,
      });
    })
    .filter((member) => memberMatchesQuery(member, term));
}

export async function fetchNetworkUsers(
  limitCount = 50,
  excludeUid?: string | null,
): Promise<MemberProfile[]> {
  const usersQuery = query(
    collection(db, 'users'),
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  );
  const snap = await getDocs(usersQuery);

  return snap.docs
    .map((userDoc) => {
      const data = userDoc.data() as UserProfileDoc;
      return profileDocToMember({
        ...data,
        uid: data.uid || userDoc.id,
      });
    })
    .filter((member) => member.id !== excludeUid);
}

export async function updateUserProfile(uid: string, partial: UserProfileUpdate) {
  const payload: UserProfileUpdate = {};
  if (partial.name != null) payload.name = partial.name.trim();
  if (partial.city != null) payload.city = partial.city.trim();
  if (partial.interests != null) payload.interests = partial.interests;
  if (partial.photoUri !== undefined) payload.photoUri = partial.photoUri || null;
  if (partial.coverPhoto !== undefined) payload.coverPhoto = partial.coverPhoto || null;
  await setDoc(profileRef(uid), payload, { merge: true });
  if (partial.email != null) {
    await setDoc(privateContactRef(uid), { email: partial.email.trim() }, { merge: true });
  }
}

export function mapProfileError(code: string): string {
  const messages: Record<string, string> = {
    'permission-denied': 'Нет доступа к профилю. Проверьте правила Firestore',
    'unavailable': 'Firestore недоступен. Проверьте подключение к интернету',
    'not-found': 'Профиль не найден',
  };
  return messages[code] ?? 'Не удалось загрузить профиль. Попробуйте позже';
}
