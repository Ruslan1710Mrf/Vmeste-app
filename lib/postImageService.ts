import * as FileSystem from 'expo-file-system/legacy';
import { auth, storage } from './firebase';

const UPLOAD_TIMEOUT_MS = 30_000;

function guessContentType(uri: string): string {
  const ext = uri.split('.').pop()?.split('?')[0]?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  return 'image/jpeg';
}

function guessExtension(contentType: string): string {
  if (contentType.includes('png')) return 'png';
  if (contentType.includes('webp')) return 'webp';
  if (contentType.includes('gif')) return 'gif';
  return 'jpg';
}

function withTimeout<T>(promise: Promise<T>, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), UPLOAD_TIMEOUT_MS);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

function mapUploadError(error: unknown): Error {
  const message = error instanceof Error ? error.message : 'Не удалось загрузить фото';
  if (message.includes('Firebase Storage') || message.includes('Войдите')) {
    return new Error(message);
  }
  return new Error(`Не удалось загрузить фото: ${message}`);
}

function getBucket(): string {
  // storage.app.options.storageBucket is set by the Firebase config
  // e.g. "veste-app-bffb0.appspot.com" or "veste-app-bffb0.firebasestorage.app"
  // @ts-ignore - accessing internal app options
  const bucket = storage.app?.options?.storageBucket;
  if (!bucket) {
    throw new Error('Firebase Storage bucket не настроен в конфиге.');
  }
  return bucket;
}

/**
 * Uploads a local file directly to the Firebase Storage REST API using
 * expo-file-system's native uploadAsync. This bypasses the Firebase JS SDK's
 * uploadBytes()/Blob path entirely, which is broken on React Native 0.74+
 * ("Creating blobs from 'ArrayBuffer' and 'ArrayBufferView' are not supported").
 */
async function uploadViaRest(localUri: string, storagePath: string, contentType: string): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Войдите в аккаунт, чтобы публиковать фото.');
  }

  const token = await user.getIdToken();
  const bucket = getBucket();
  const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=media&name=${encodeURIComponent(
    storagePath,
  )}`;

  const result = await withTimeout(
    FileSystem.uploadAsync(uploadUrl, localUri, {
      httpMethod: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': contentType,
      },
    }),
    'Загрузка фото заняла слишком много времени. Проверьте Firebase Storage.',
  );

  if (result.status < 200 || result.status >= 300) {
    throw new Error(`Firebase Storage вернул ошибку ${result.status}: ${result.body}`);
  }

  let parsed: { name?: string; downloadTokens?: string };
  try {
    parsed = JSON.parse(result.body);
  } catch {
    throw new Error('Firebase Storage вернул неожиданный ответ.');
  }

  const name = parsed.name ?? storagePath;
  const token2 = parsed.downloadTokens ? `&token=${parsed.downloadTokens}` : '';
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(
    name,
  )}?alt=media${token2}`;
}

async function uploadImage(
  uid: string,
  localUri: string,
  guestErrorMessage: string,
  buildPath: (uid: string, extension: string) => string,
): Promise<string> {
  if (!uid || uid === 'guest') {
    throw new Error(guestErrorMessage);
  }

  try {
    const contentType = guessContentType(localUri);
    const extension = guessExtension(contentType);
    const path = buildPath(uid, extension);
    return await uploadViaRest(localUri, path, contentType);
  } catch (error) {
    throw mapUploadError(error);
  }
}

export function uploadPostImage(uid: string, localUri: string): Promise<string> {
  return uploadImage(
    uid,
    localUri,
    'Войдите в аккаунт, чтобы публиковать фото.',
    (ownerId, extension) => `posts/${ownerId}/${Date.now()}.${extension}`,
  );
}

export function uploadProfilePhoto(uid: string, localUri: string): Promise<string> {
  return uploadImage(
    uid,
    localUri,
    'Войдите в аккаунт, чтобы загрузить фото профиля.',
    (ownerId, extension) => `profiles/${ownerId}/photo.${extension}`,
  );
}

export function uploadProfileCover(uid: string, localUri: string): Promise<string> {
  return uploadImage(
    uid,
    localUri,
    'Войдите в аккаунт, чтобы загрузить обложку профиля.',
    (ownerId, extension) => `profiles/${ownerId}/cover.${extension}`,
  );
}
