import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { arrayRemove, arrayUnion, doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { Platform } from 'react-native';
import { db } from './firebase';

// Токены и настройка пушей лежат в users/{uid}/private/push: этот документ
// читает и пишет только владелец (правило private/{docId}), а Cloud Functions
// pushOnNewMessage / pushOnNewReply читают его через Admin SDK.

export type PushData =
  | { type: 'message'; fromUid: string; convId: string }
  | { type: 'comment'; postId: string };

let currentToken: string | null = null;
// Пользователь выключил «Push-уведомления» в настройках: сами не спрашиваем.
let optedOut = false;
// Чат, открытый на экране: пуш о сообщении из него не показываем баннером.
let activeConversationId: string | null = null;

const isSupported = () => Platform.OS !== 'web' && Device.isDevice;

const pushRef = (uid: string) => doc(db, 'users', uid, 'private', 'push');

export function setActiveConversation(convId: string | null) {
  activeConversationId = convId;
}

export function configureNotificationHandler() {
  if (Platform.OS === 'web') return;
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      const data = notification.request.content.data as Partial<{ type: string; convId: string }>;
      const isOpenChat = data?.type === 'message' && !!data.convId && data.convId === activeConversationId;
      return {
        shouldShowBanner: !isOpenChat,
        shouldShowList: !isOpenChat,
        shouldPlaySound: !isOpenChat,
        shouldSetBadge: false,
      };
    },
  });
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Vmeste',
    importance: Notifications.AndroidImportance.HIGH,
  });
}

async function fetchExpoToken(): Promise<string | null> {
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return null;
  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return data;
}

async function saveToken(uid: string, token: string) {
  currentToken = token;
  await setDoc(
    pushRef(uid),
    { tokens: arrayUnion(token), updatedAt: serverTimestamp() },
    { merge: true },
  );
}

/**
 * Без диалога: если разрешение уже дано, обновляет токен этого устройства.
 * Вызывается после входа и при каждом запуске.
 */
export async function syncPushToken(uid: string): Promise<void> {
  if (!isSupported()) return;
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;
    await ensureAndroidChannel();
    const token = await fetchExpoToken();
    if (token) await saveToken(uid, token);
  } catch (err) {
    console.warn('[push] sync failed', err);
  }
}

/**
 * Показывает системный запрос, если его ещё не показывали. Вызывать в момент
 * действия (отправил сообщение, написал комментарий), а не на старте —
 * так больше людей разрешают уведомления.
 */
export async function requestPushPermission(
  uid: string,
  options: { force?: boolean } = {},
): Promise<boolean> {
  if (!isSupported()) return false;
  if (optedOut && !options.force) return false;
  try {
    const current = await Notifications.getPermissionsAsync();
    let status = current.status;
    if (status !== 'granted' && current.canAskAgain) {
      status = (await Notifications.requestPermissionsAsync()).status;
    }
    if (status !== 'granted') return false;
    await ensureAndroidChannel();
    const token = await fetchExpoToken();
    if (token) await saveToken(uid, token);
    return true;
  } catch (err) {
    console.warn('[push] request failed', err);
    return false;
  }
}

/** Переключатель «Push-уведомления» в настройках — его учитывает сервер. */
export async function setPushEnabled(uid: string, enabled: boolean): Promise<void> {
  optedOut = !enabled;
  await setDoc(pushRef(uid), { enabled, updatedAt: serverTimestamp() }, { merge: true });
}

/** Локальная настройка после загрузки состояния: синхронизируем с сервером. */
export function applyPushPreference(uid: string, enabled: boolean) {
  optedOut = !enabled;
  if (!enabled) {
    setPushEnabled(uid, false).catch((err) => console.warn('[push] preference sync failed', err));
  }
}

/** Перед выходом из аккаунта: это устройство больше не получает его пуши. */
export async function unregisterPushToken(uid: string): Promise<void> {
  if (!currentToken) return;
  const token = currentToken;
  currentToken = null;
  try {
    await updateDoc(pushRef(uid), { tokens: arrayRemove(token) });
  } catch (err) {
    console.warn('[push] unregister failed', err);
  }
}

/**
 * Нажатие на пуш: и когда приложение открыто, и когда оно запущено этим
 * нажатием (getLastNotificationResponse). Возвращает функцию отписки.
 */
export function subscribeToPushTaps(onTap: (data: PushData) => void): () => void {
  if (Platform.OS === 'web') return () => {};
  const handle = (response: Notifications.NotificationResponse | null) => {
    const data = response?.notification.request.content.data as PushData | undefined;
    if (!data?.type) return;
    Notifications.clearLastNotificationResponse();
    onTap(data);
  };
  handle(Notifications.getLastNotificationResponse());
  const subscription = Notifications.addNotificationResponseReceivedListener(handle);
  return () => subscription.remove();
}
