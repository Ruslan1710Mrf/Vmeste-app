import Constants from 'expo-constants';
import { Platform } from 'react-native';

const AI_PROXY_PORT = 3001;

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

  return 'https://capable-growth-production-9ad4.up.railway.app';
}

export async function sendImmigrationChat(history) {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error('Не задан URL AI-прокси. Укажите EXPO_PUBLIC_AI_PROXY_URL.');
  }

  const response = await fetch(`${baseUrl}/api/ai-chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: history.map((msg) => ({
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
