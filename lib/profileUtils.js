import { DEFAULT_PROFILE } from '../data/profile';

function emptyProfileBase(user) {
  return {
    name: user?.displayName?.trim() || 'Пользователь',
    email: user?.email ?? '',
    city: '',
    bio: '',
    interests: [],
    memberSince: formatMemberSince(new Date()),
    photoUri: null,
    coverPhoto: null,
    originCountry: '',
    immigrationStatus: 'Не указано',
    profession: '',
    linkedInUrl: '',
    telegramUrl: '',
  };
}

export function mergeProfileWithAuth(savedProfile, user) {
  const base = savedProfile ?? emptyProfileBase(user);
  if (!user) return base;

  return {
    ...base,
    name: user.displayName?.trim() || base.name,
    email: user.email ?? base.email,
  };
}

export function mergeProfiles(firestoreProfile, localProfile, user) {
  const base = mergeProfileWithAuth(localProfile, user);
  if (!firestoreProfile) return base;

  return {
    ...base,
    name: firestoreProfile.name || base.name,
    email: firestoreProfile.email || base.email,
    city: firestoreProfile.city || base.city,
    bio: base.bio,
    interests: firestoreProfile.interests?.length
      ? firestoreProfile.interests
      : base.interests,
    memberSince: formatFirestoreCreatedAt(firestoreProfile.createdAt) || base.memberSince,
    photoUri: firestoreProfile.photoUri ?? base.photoUri,
    coverPhoto: firestoreProfile.coverPhoto ?? base.coverPhoto,
  };
}

export function profileFromNewUser(user, displayName) {
  return {
    ...emptyProfileBase(user),
    name: displayName.trim() || user.displayName || 'Пользователь',
    email: user.email ?? '',
  };
}

export function buildUserProfileDoc(uid, profile) {
  return {
    uid,
    name: profile.name?.trim() || 'Пользователь',
    email: profile.email?.trim() ?? '',
    city: profile.city?.trim() ?? '',
    interests: profile.interests ?? [],
  };
}

export function profileToFirestoreUpdate(profile) {
  return {
    name: profile.name?.trim() || 'Пользователь',
    email: profile.email?.trim() ?? '',
    city: profile.city?.trim() ?? '',
    interests: profile.interests ?? [],
    photoUri: profile.photoUri || null,
    coverPhoto: profile.coverPhoto || null,
  };
}

export function needsProfileSetup(profile) {
  return !profile.city?.trim();
}

export function getFirstName(profile, user) {
  const name = user?.displayName?.trim() || profile.name?.trim();
  if (!name) return 'друг';
  return name.split(/\s+/)[0];
}

function formatMemberSince(date) {
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

function formatFirestoreCreatedAt(createdAt) {
  if (!createdAt) return '';
  const date =
    typeof createdAt.toDate === 'function'
      ? createdAt.toDate()
      : new Date(createdAt);
  if (Number.isNaN(date.getTime())) return '';
  return formatMemberSince(date);
}

export function getProfileInitial(profile) {
  const source = profile.name?.trim() || profile.email?.trim() || '?';
  return source.charAt(0).toUpperCase();
}

export function getProfileCityLabel(profile) {
  const city = profile.city?.trim();
  if (!city) return 'США';
  return city.split(',')[0];
}
