import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { Platform } from 'react-native';
import { DEV_MODE_SKIP_AUTH } from './devMode';
import { auth } from './firebase';
import {
  createUserProfile,
  fetchUserProfile,
  mapProfileError,
  type UserProfileDoc,
} from './userProfileService';

let signedOutFlag = false;

export function markSignedOut() {
  signedOutFlag = true;
}

export function clearSignedOutFlag() {
  signedOutFlag = false;
}

export function shouldRequireLogin() {
  if (!DEV_MODE_SKIP_AUTH) return true;
  return signedOutFlag;
}

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';

async function ensureGoogleUserProfile(user: User) {
  let profile: UserProfileDoc | null = null;
  try {
    profile = await fetchUserProfile(user.uid);
  } catch {
    // Профиль будет загружен повторно в App.js после входа
  }

  if (!profile) {
    try {
      await createUserProfile(user.uid, {
        uid: user.uid,
        name: user.displayName?.trim() || 'Пользователь',
        email: user.email ?? '',
        city: '',
        interests: [],
      });
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      throw new Error(mapProfileError(code));
    }
  }

  return { user, profile };
}

export async function signInWithGoogle() {
  if (Platform.OS === 'web') {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    return ensureGoogleUserProfile(credential.user);
  }

  if (!GOOGLE_WEB_CLIENT_ID) {
    throw new Error('auth.errors.googleNotConfigured');
  }

  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  const response = await GoogleSignin.signIn();
  if (response.type === 'cancelled') {
    const err = new Error('Вход отменён');
    Object.assign(err, { code: statusCodes.SIGN_IN_CANCELLED });
    throw err;
  }

  const idToken = response.data.idToken;
  if (!idToken) {
    throw new Error('Не удалось получить токен Google');
  }

  const firebaseCredential = GoogleAuthProvider.credential(idToken);
  const credential = await signInWithCredential(auth, firebaseCredential);
  return ensureGoogleUserProfile(credential.user);
}

export async function signInWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password,
  );
  if (!credential.user.emailVerified) {
    await sendEmailVerification(credential.user);
    const err = new Error('Подтвердите email перед входом. Мы отправили письмо повторно.');
    Object.assign(err, { code: 'auth/email-not-verified' });
    throw err;
  }
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
  await sendEmailVerification(credential.user);
  return credential;
}

export async function sendPasswordReset(email: string) {
  return sendPasswordResetEmail(auth, email.trim());
}

export async function signOut() {
  await firebaseSignOut(auth);
  markSignedOut();
}

export async function reauthenticateWithPassword(password: string) {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error('Пользователь не найден');
  }
  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);
}

export async function deleteCurrentAccount() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Пользователь не найден');
  }
  await deleteUser(user);
  markSignedOut();
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

export async function updateDisplayName(displayName: string) {
  const user = auth.currentUser;
  if (!user) return;
  await updateProfile(user, { displayName: displayName.trim() });
}

// Возвращает ключ перевода (lib/i18n.js), а не готовый текст — экран должен
// передать его через t() с учётом выбранного языка интерфейса.
export function mapAuthError(code: string): string {
  const keys: Record<string, string> = {
    'auth/email-already-in-use': 'auth.errors.emailInUse',
    'auth/invalid-email': 'auth.errors.invalidEmail',
    'auth/weak-password': 'auth.errors.passwordTooShort',
    'auth/user-not-found': 'auth.errors.userNotFound',
    'auth/wrong-password': 'auth.errors.wrongPassword',
    'auth/invalid-credential': 'auth.errors.invalidCredential',
    'auth/too-many-requests': 'auth.errors.tooManyRequests',
    'auth/missing-password': 'auth.errors.missingPassword',
    'auth/account-exists-with-different-credential':
      'auth.errors.accountExistsDifferentCredential',
    'auth/popup-closed-by-user': 'auth.errors.popupClosed',
    'auth/email-not-verified': 'auth.errors.emailNotVerified',
  };
  return keys[code] ?? 'auth.errors.generic';
}
