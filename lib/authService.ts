import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth } from './firebase';
import {
  createUserProfile,
  fetchUserProfile,
  mapProfileError,
  type UserProfileDoc,
} from './userProfileService';

export async function signInWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password,
  );
  let profile: UserProfileDoc | null = null;
  try {
    profile = await fetchUserProfile(credential.user.uid);
  } catch {
    // Профиль будет загружен повторно в App.js после входа
  }
  return { user: credential.user, profile };
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string,
) {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password,
  );
  const name = displayName.trim() || 'Пользователь';
  await updateProfile(credential.user, { displayName: name });
  try {
    await createUserProfile(credential.user.uid, {
      uid: credential.user.uid,
      name,
      email: credential.user.email ?? email.trim(),
      city: '',
      interests: [],
    });
  } catch (err: unknown) {
    const code = (err as { code?: string }).code ?? '';
    throw new Error(mapProfileError(code));
  }
  return credential;
}

export async function sendPasswordReset(email: string) {
  return sendPasswordResetEmail(auth, email.trim());
}

export async function signOut() {
  return firebaseSignOut(auth);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

export async function updateDisplayName(displayName: string) {
  const user = auth.currentUser;
  if (!user) return;
  await updateProfile(user, { displayName: displayName.trim() });
}

export function mapAuthError(code: string): string {
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'Этот email уже зарегистрирован',
    'auth/invalid-email': 'Неверный формат email',
    'auth/weak-password': 'Пароль должен быть не менее 6 символов',
    'auth/user-not-found': 'Пользователь не найден',
    'auth/wrong-password': 'Неверный пароль',
    'auth/invalid-credential': 'Неверный email или пароль',
    'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже',
    'auth/missing-password': 'Введите пароль',
  };
  return messages[code] ?? 'Произошла ошибка. Попробуйте снова';
}
