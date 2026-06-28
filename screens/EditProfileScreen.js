import * as ImagePicker from 'expo-image-picker';
import { useMemo, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { IMMIGRATION_STATUS_OPTIONS } from '../data/profileFields';
import { getProfileInitial } from '../lib/profileUtils';
import { useTheme } from '../lib/ThemeContext';
import { useI18n } from '../lib/i18n';

const HERO_HEIGHT = 320;

function ProfileCoverPreview({ coverPhoto, styles }) {
  if (coverPhoto) {
    return (
      <Image
        source={{ uri: coverPhoto }}
        style={styles.coverImage}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={styles.coverGradient}>
      <Svg
        width="100%"
        height={HERO_HEIGHT}
        viewBox={`0 0 100 ${HERO_HEIGHT}`}
        preserveAspectRatio="none"
      >
        <Defs>
          <LinearGradient id="editProfileCoverGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#EA580C" />
            <Stop offset="100%" stopColor="#1E293B" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height={HERO_HEIGHT} fill="url(#editProfileCoverGradient)" />
      </Svg>
    </View>
  );
}

function ImmigrationStatusPicker({ value, onChange, styles }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Pressable
        style={({ pressed }) => [styles.selectTrigger, pressed && styles.selectPressed]}
        onPress={() => setOpen((prev) => !prev)}
      >
        <Text style={styles.selectValue}>{value || t('editProfile.selectStatus')}</Text>
        <Text style={styles.selectChevron}>{open ? '▲' : '▼'}</Text>
      </Pressable>
      {open ? (
        <View style={styles.selectMenu}>
          {IMMIGRATION_STATUS_OPTIONS.map((option) => (
            <Pressable
              key={option}
              style={({ pressed }) => [
                styles.selectOption,
                value === option && styles.selectOptionActive,
                pressed && styles.selectPressed,
              ]}
              onPress={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              <Text
                style={[
                  styles.selectOptionText,
                  value === option && styles.selectOptionTextActive,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function EditProfileScreen({ profile, onBack, onSave }) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [name, setName] = useState(profile.name);
  const [city, setCity] = useState(profile.city);
  const [bio, setBio] = useState(profile.bio);
  const [interests, setInterests] = useState(profile.interests.join(', '));
  const [photoUri, setPhotoUri] = useState(profile.photoUri ?? null);
  const [coverPhoto, setCoverPhoto] = useState(profile.coverPhoto ?? null);
  const [originCountry, setOriginCountry] = useState(profile.originCountry ?? '');
  const [immigrationStatus, setImmigrationStatus] = useState(
    profile.immigrationStatus ?? IMMIGRATION_STATUS_OPTIONS[0],
  );
  const [profession, setProfession] = useState(profile.profession ?? '');
  const [linkedInUrl, setLinkedInUrl] = useState(profile.linkedInUrl ?? '');
  const [telegramUrl, setTelegramUrl] = useState(profile.telegramUrl ?? '');

  const initial = getProfileInitial({ ...profile, name: name.trim() || profile.name });

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const pickCoverPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setCoverPhoto(result.assets[0].uri);
    }
  };

  const removePhoto = () => setPhotoUri(null);
  const removeCoverPhoto = () => setCoverPhoto(null);

  const handleSave = () => {
    onSave({
      ...profile,
      name: name.trim(),
      city: city.trim(),
      bio: bio.trim(),
      interests: interests
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      photoUri: photoUri || null,
      coverPhoto: coverPhoto || null,
      originCountry: originCountry.trim(),
      immigrationStatus,
      profession: profession.trim(),
      linkedInUrl: linkedInUrl.trim(),
      telegramUrl: telegramUrl.trim(),
    });
    onBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}
          onPress={onBack}
        >
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backLabel}>{t('editProfile.backLabel')}</Text>
        </Pressable>
        <Text style={styles.screenTitle}>{t('editProfile.title')}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        removeClippedSubviews={Platform.OS !== 'android'}
      >
        <Text style={styles.label}>{t('editProfile.coverPhotoLabel')}</Text>
        <Pressable
          style={({ pressed }) => [styles.heroPreview, pressed && styles.backPressed]}
          onPress={pickCoverPhoto}
        >
          <View style={styles.coverLayer} pointerEvents="none">
            <ProfileCoverPreview coverPhoto={coverPhoto} styles={styles} />
          </View>
          {coverPhoto ? <View style={styles.heroScrim} pointerEvents="none" /> : null}
          <View style={styles.heroPreviewContent} pointerEvents="none">
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.heroAvatarImage} />
            ) : (
              <View style={styles.heroAvatarPlaceholder}>
                <Text style={styles.heroAvatarText}>{initial}</Text>
              </View>
            )}
            <Text style={styles.heroName}>{name.trim() || t('editProfile.yourName')}</Text>
            {profession.trim() ? (
              <Text style={styles.heroProfession}>{profession.trim()}</Text>
            ) : null}
            {city.trim() ? (
              <Text style={styles.heroMeta}>🇺🇸 {city.trim()}</Text>
            ) : null}
            {bio.trim() ? (
              <Text style={styles.heroBio} numberOfLines={2}>{bio.trim()}</Text>
            ) : null}
          </View>
        </Pressable>
        <View style={styles.coverActions}>
          <Pressable
            style={({ pressed }) => [styles.photoActionButton, pressed && styles.backPressed]}
            onPress={pickCoverPhoto}
          >
            <Text style={styles.photoActionText}>{t('editProfile.uploadCover')}</Text>
          </Pressable>
          {coverPhoto ? (
            <Pressable
              style={({ pressed }) => [styles.photoRemoveButton, pressed && styles.backPressed]}
              onPress={removeCoverPhoto}
            >
              <Text style={styles.photoRemoveText}>{t('editProfile.removeCover')}</Text>
            </Pressable>
          ) : null}
        </View>

        <Text style={styles.label}>{t('editProfile.profilePhotoLabel')}</Text>
        <View style={styles.photoRow}>
          <Pressable
            style={({ pressed }) => [styles.photoButton, pressed && styles.backPressed]}
            onPress={pickPhoto}
          >
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderText}>{initial}</Text>
              </View>
            )}
          </Pressable>
          <View style={styles.photoActions}>
            <Pressable
              style={({ pressed }) => [styles.photoActionButton, pressed && styles.backPressed]}
              onPress={pickPhoto}
            >
              <Text style={styles.photoActionText}>{t('editProfile.uploadPhoto')}</Text>
            </Pressable>
            {photoUri ? (
              <Pressable
                style={({ pressed }) => [styles.photoRemoveButton, pressed && styles.backPressed]}
                onPress={removePhoto}
              >
                <Text style={styles.photoRemoveText}>{t('editProfile.remove')}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <Text style={styles.label}>{t('editProfile.nameLabel')}</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text style={styles.label}>{t('editProfile.professionLabel')}</Text>
        <TextInput
          style={styles.input}
          value={profession}
          onChangeText={setProfession}
          placeholder={t('editProfile.professionPlaceholder')}
          placeholderTextColor="#94A3B8"
        />

        <Text style={styles.label}>{t('editProfile.cityLabel')}</Text>
        <TextInput style={styles.input} value={city} onChangeText={setCity} />

        <Text style={styles.label}>{t('editProfile.originCountryLabel')}</Text>
        <TextInput
          style={styles.input}
          value={originCountry}
          onChangeText={setOriginCountry}
          placeholder={t('editProfile.originCountryPlaceholder')}
          placeholderTextColor="#94A3B8"
        />

        <Text style={styles.label}>{t('editProfile.immigrationStatusLabel')}</Text>
        <ImmigrationStatusPicker
          value={immigrationStatus}
          onChange={setImmigrationStatus}
          styles={styles}
        />

        <Text style={styles.label}>{t('editProfile.bioLabel')}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Text style={styles.label}>{t('editProfile.interestsLabel')}</Text>
        <TextInput style={styles.input} value={interests} onChangeText={setInterests} />

        <Text style={styles.label}>{t('editProfile.linkedInLabel')}</Text>
        <TextInput
          style={styles.input}
          value={linkedInUrl}
          onChangeText={setLinkedInUrl}
          placeholder="https://linkedin.com/in/username"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          keyboardType="url"
        />

        <Text style={styles.label}>{t('editProfile.telegramLabel')}</Text>
        <TextInput
          style={styles.input}
          value={telegramUrl}
          onChangeText={setTelegramUrl}
          placeholder={t('editProfile.telegramPlaceholder')}
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
        />

        <Pressable
          style={({ pressed }) => [styles.saveButton, pressed && styles.savePressed]}
          onPress={handleSave}
        >
          <Text style={styles.saveText}>{t('editProfile.save')}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      marginBottom: 16,
      paddingVertical: 6,
      paddingRight: 12,
    },
    backPressed: { opacity: 0.6 },
    backIcon: { fontSize: 20, color: colors.accent, marginRight: 4 },
    backLabel: { fontSize: 16, fontWeight: '500', color: colors.accent },
    screenTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.5,
    },
    scroll: { flex: 1 },
    content: { paddingHorizontal: 24, paddingBottom: 40, flexGrow: 1 },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 8,
      marginTop: 16,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.text,
    },
    textArea: { minHeight: 100, paddingTop: 12 },
    heroPreview: {
      height: HERO_HEIGHT,
      borderRadius: 12,
      overflow: 'hidden',
      position: 'relative',
    },
    coverLayer: {
      ...StyleSheet.absoluteFillObject,
    },
    coverGradient: {
      width: '100%',
      height: HERO_HEIGHT,
    },
    coverImage: {
      width: '100%',
      height: HERO_HEIGHT,
    },
    heroScrim: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(15, 23, 42, 0.35)',
    },
    heroPreviewContent: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      zIndex: 1,
    },
    heroAvatarImage: {
      width: 88,
      height: 88,
      borderRadius: 44,
      borderWidth: 3,
      borderColor: '#FFFFFF',
    },
    heroAvatarPlaceholder: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: '#FFFFFF',
    },
    heroAvatarText: {
      fontSize: 36,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    heroName: {
      fontSize: 24,
      fontWeight: '700',
      color: '#FFFFFF',
      marginTop: 12,
      marginBottom: 4,
      textAlign: 'center',
      textShadowColor: 'rgba(15, 23, 42, 0.45)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    heroProfession: {
      fontSize: 15,
      fontWeight: '500',
      color: 'rgba(255, 255, 255, 0.92)',
      textAlign: 'center',
      marginBottom: 8,
      textShadowColor: 'rgba(15, 23, 42, 0.45)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    heroMeta: {
      fontSize: 15,
      color: 'rgba(255, 255, 255, 0.9)',
      marginBottom: 8,
      textAlign: 'center',
    },
    heroBio: {
      fontSize: 14,
      lineHeight: 20,
      color: 'rgba(255, 255, 255, 0.88)',
      textAlign: 'center',
    },
    coverActions: {
      marginTop: 8,
      marginBottom: 8,
      gap: 8,
    },
    photoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    photoButton: {
      borderRadius: 40,
      overflow: 'hidden',
    },
    photoPreview: {
      width: 80,
      height: 80,
      borderRadius: 40,
    },
    photoPlaceholder: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    photoPlaceholderText: {
      fontSize: 32,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    photoActions: {
      flex: 1,
      gap: 8,
    },
    photoActionButton: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    photoActionText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.accent,
    },
    photoRemoveButton: {
      paddingVertical: 8,
      alignItems: 'center',
    },
    photoRemoveText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    selectTrigger: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    selectPressed: { opacity: 0.85 },
    selectValue: {
      fontSize: 15,
      color: colors.text,
    },
    selectChevron: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    selectMenu: {
      marginTop: 8,
      backgroundColor: colors.surface,
      borderRadius: 12,
      overflow: 'hidden',
    },
    selectOption: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    selectOptionActive: {
      backgroundColor: colors.accentSoft,
    },
    selectOptionText: {
      fontSize: 15,
      color: colors.text,
    },
    selectOptionTextActive: {
      fontWeight: '600',
      color: colors.accent,
    },
    saveButton: {
      backgroundColor: colors.accent,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 32,
    },
    savePressed: { opacity: 0.9 },
    saveText: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },
  });
