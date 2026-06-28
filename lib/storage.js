import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_SETTINGS } from './chatUtils';

export const ONBOARDING_SEEN_KEY = 'vmeste:onboardingSeen';

export async function loadOnboardingSeen() {
  try {
    return (await AsyncStorage.getItem(ONBOARDING_SEEN_KEY)) === 'true';
  } catch {
    return false;
  }
}

export async function saveOnboardingSeen() {
  try {
    await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
  } catch {
    // storage unavailable on some platforms during dev
  }
}

function keysForUser(uid) {
  const prefix = uid ? `vmeste:${uid}:` : 'vmeste:guest:';
  return {
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
    tab: `${prefix}tab`,
    profileView: `${prefix}profileView`,
    profileReturnTab: `${prefix}profileReturnTab`,
    feedCategory: `${prefix}feedCategory`,
  };
}

export async function loadAppState(uid) {
  const KEYS = keysForUser(uid);
  try {
    const entries = await AsyncStorage.multiGet(Object.values(KEYS));
    const map = Object.fromEntries(entries);
    return {
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
      tab: map[KEYS.tab] ?? null,
      profileView: map[KEYS.profileView] ? JSON.parse(map[KEYS.profileView]) : null,
      profileReturnTab: map[KEYS.profileReturnTab] ? JSON.parse(map[KEYS.profileReturnTab]) : null,
      feedCategory: map[KEYS.feedCategory] ? JSON.parse(map[KEYS.feedCategory]) : null,
    };
  } catch {
    return {};
  }
}

export async function saveAppState(uid, state) {
  const KEYS = keysForUser(uid);
  try {
    await AsyncStorage.multiSet([
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
      [KEYS.tab, state.tab ?? 'home'],
      [KEYS.profileView, JSON.stringify(state.profileView ?? null)],
      [KEYS.profileReturnTab, JSON.stringify(state.profileReturnTab ?? null)],
      [KEYS.feedCategory, JSON.stringify(state.feedCategory ?? 'Все')],
    ]);
  } catch {
    // storage unavailable on some platforms during dev
  }
}
