import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firestore';

export type UserProfileDoc = {
  name: string;
  email: string;
  city: string;
  bio: string;
  interests: string[];
  memberSince: string;
  updatedAt: string;
};

function profileRef(uid: string) {
  return doc(db, 'users', uid);
}

export async function createUserProfile(uid: string, profile: Omit<UserProfileDoc, 'updatedAt'>) {
  await setDoc(profileRef(uid), {
    ...profile,
    updatedAt: new Date().toISOString(),
  });
}

export async function fetchUserProfile(uid: string): Promise<UserProfileDoc | null> {
  const snap = await getDoc(profileRef(uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfileDoc;
}

export async function updateUserProfile(uid: string, partial: Partial<UserProfileDoc>) {
  await setDoc(
    profileRef(uid),
    {
      ...partial,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}
