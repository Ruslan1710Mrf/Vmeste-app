import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_SETTINGS } from './chatUtils';

function keysForUser(uid) {
  const prefix = uid ? `vmeste:${uid}:` : 'vmeste:guest:';
  return {
    onboardingDone: `${prefix}onboardingDone`,
    profile: `${prefix}profile`,
    savedJobIds: `${prefix}savedJobIds`,
    connectedIds: `${prefix}connectedIds`,
    registeredEventIds: `${prefix}registeredEventIds`,
    readNotificationIds: `${prefix}readNotificationIds`,
    checkedChecklistIds: `${prefix}checkedChecklistIds`,
    likedPostIds: `${prefix}likedPostIds`,
    posts: `${prefix}posts`,
    chatThreads: `${prefix}chatThreads`,
    settings: `${prefix}settings`,
  };
}

export async function loadAppState(uid) {
  const KEYS = keysForUser(uid);
  try {
    const entries = await AsyncStorage.multiGet(Object.values(KEYS));
    const map = Object.fromEntries(entries);
    return {
      onboardingDone: map[KEYS.onboardingDone] === 'true',
      profile: map[KEYS.profile] ? JSON.parse(map[KEYS.profile]) : null,
      savedJobIds: map[KEYS.savedJobIds] ? JSON.parse(map[KEYS.savedJobIds]) : null,
      connectedIds: map[KEYS.connectedIds] ? JSON.parse(map[KEYS.connectedIds]) : null,
      registeredEventIds: map[KEYS.registeredEventIds]
        ? JSON.parse(map[KEYS.registeredEventIds])
        : null,
      readNotificationIds: map[KEYS.readNotificationIds]
        ? JSON.parse(map[KEYS.readNotificationIds])
        : null,
      checkedChecklistIds: map[KEYS.checkedChecklistIds]
        ? JSON.parse(map[KEYS.checkedChecklistIds])
        : null,
      likedPostIds: map[KEYS.likedPostIds] ? JSON.parse(map[KEYS.likedPostIds]) : null,
      posts: map[KEYS.posts] ? JSON.parse(map[KEYS.posts]) : null,
      chatThreads: map[KEYS.chatThreads] ? JSON.parse(map[KEYS.chatThreads]) : null,
      settings: map[KEYS.settings] ? JSON.parse(map[KEYS.settings]) : null,
    };
  } catch {
    return {};
  }
}

export async function saveAppState(uid, state) {
  const KEYS = keysForUser(uid);
  try {
    await AsyncStorage.multiSet([
      [KEYS.onboardingDone, state.onboardingDone ? 'true' : 'false'],
      [KEYS.profile, JSON.stringify(state.profile)],
      [KEYS.savedJobIds, JSON.stringify(state.savedJobIds)],
      [KEYS.connectedIds, JSON.stringify(state.connectedIds)],
      [KEYS.registeredEventIds, JSON.stringify(state.registeredEventIds)],
      [KEYS.readNotificationIds, JSON.stringify(state.readNotificationIds)],
      [KEYS.checkedChecklistIds, JSON.stringify(state.checkedChecklistIds)],
      [KEYS.likedPostIds, JSON.stringify(state.likedPostIds)],
      [KEYS.posts, JSON.stringify(state.posts)],
      [KEYS.chatThreads, JSON.stringify(state.chatThreads)],
      [KEYS.settings, JSON.stringify(state.settings ?? DEFAULT_SETTINGS)],
    ]);
  } catch {
    // storage unavailable on some platforms during dev
  }
}
