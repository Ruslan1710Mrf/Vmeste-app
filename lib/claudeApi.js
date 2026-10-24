import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { auth } from './firebase';

const AI_PROXY_PORT = 3001;
// В dev (локальный server/aiProxy.js) путь /api/ai-chat; в проде
// Cloud Function aiChat сама является эндпоинтом, путь пустой.
const AI_CHAT_PATH = __DEV__ && !process.env.EXPO_PUBLIC_AI_PROXY_URL ? '/api/ai-chat' : '';
// Каждый запрос оплачивается по длине истории: шлём только последние сообщения.
const AI_HISTORY_LIMIT = 20;

function recentHistory(history) {
  const recent = history.slice(-AI_HISTORY_LIMIT);
  // Claude API требует, чтобы история начиналась с сообщения пользователя.
  const firstUser = recent.findIndex((msg) => msg.role === 'user');
  return firstUser === -1 ? [] : recent.slice(firstUser);
}

function getDevHost() {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.manifest2?.extra?.expoGo?.debuggerHost ??
    Constants.linkingUri;

  if (hostUri) {
    return hostUri.replace(/^https?:\/\//, '').split(':')[0];
  }

  return 'localhost';
}

function getApiBaseUrl() {
  const configured = process.env.EXPO_PUBLIC_AI_PROXY_URL;
  if (configured) {
    return configured.replace(/\/$/, '');
  }

  if (__DEV__) {
    if (Platform.OS === 'web') {
      return `http://localhost:${AI_PROXY_PORT}`;
    }
    return `http://${getDevHost()}:${AI_PROXY_PORT}`;
  }

  // AI-помощник перенесён с Railway в Cloud Functions (функция aiChat).
  return 'https://us-central1-veste-app-bffb0.cloudfunctions.net/aiChat';
}

export async function sendImmigrationChat(history) {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error('Не задан URL AI-прокси. Укажите EXPO_PUBLIC_AI_PROXY_URL.');
  }

  // Ждём инициализации Firebase Auth (resolves после восстановления сессии)
  await auth.authStateReady();

  const user = auth.currentUser;
  if (!user) {
    throw new Error('Необходима авторизация для использования AI-ассистента.');
  }

  // getIdToken(true) — принудительно обновляет если истёк
  const token = await user.getIdToken(true);

  const response = await fetch(`${baseUrl}${AI_CHAT_PATH}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      messages: recentHistory(history).map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    }),
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.error || `Ошибка сервера: ${response.status}`);
  }

  if (!data.text) {
    throw new Error('Пустой ответ от AI-ассистента.');
  }

  return data.text;
}
