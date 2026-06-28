import * as ImagePicker from 'expo-image-picker';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { POST_CATEGORIES } from '../data/postCategories';
import { useTheme } from '../lib/ThemeContext';
import { useI18n } from '../lib/i18n';

export default function CreatePostScreen({ post, onBack, onPublish }) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isEditing = Boolean(post);
  const [content, setContent] = useState(post?.content ?? '');
  const [imageUri, setImageUri] = useState(post?.imageUri ?? null);
  const [category, setCategory] = useState(
    post?.category && POST_CATEGORIES.includes(post.category)
      ? post.category
      : POST_CATEGORIES[0],
  );
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');

  const canPublish = (content.trim().length > 0 || Boolean(imageUri)) && !publishing;

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError(t('createPost.galleryPermissionError'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setImageUri(result.assets[0].uri);
      if (error) setError('');
    }
  };

  const removeImage = () => setImageUri(null);

  const handlePublish = async () => {
    const text = content.trim();
    if (!text && !imageUri) {
      setError(t('createPost.addTextOrPhotoError'));
      return;
    }

    setError('');
    setPublishing(true);
    try {
      await onPublish({ content: text, category, imageUri });
    } catch (error) {
      setError(
        error?.message ||
          (isEditing ? t('createPost.saveError') : t('createPost.publishError')),
      );
    } finally {
      setPublishing(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={onBack}
            disabled={publishing}
          >
            <Text style={styles.backIcon}>←</Text>
            <Text style={styles.backLabel}>{t('createPost.cancel')}</Text>
          </Pressable>
          <Text style={styles.title}>{isEditing ? t('createPost.editTitle') : t('createPost.newTitle')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.label}>{t('createPost.textLabel')}</Text>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            placeholder={t('createPost.textPlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={content}
            onChangeText={(value) => {
              setContent(value);
              if (error) setError('');
            }}
            multiline
            textAlignVertical="top"
            autoFocus
          />

          <Text style={styles.label}>{t('createPost.photoLabel')}</Text>
          {imageUri ? (
            <View style={styles.imagePreviewWrap}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
              <Pressable
                style={({ pressed }) => [styles.removeImageButton, pressed && styles.pressed]}
                onPress={removeImage}
                disabled={publishing}
              >
                <Text style={styles.removeImageText}>{t('createPost.removePhoto')}</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => [styles.attachButton, pressed && styles.pressed]}
              onPress={pickImage}
              disabled={publishing}
            >
              <Text style={styles.attachButtonIcon}>🖼</Text>
              <Text style={styles.attachButtonText}>{t('createPost.attachPhoto')}</Text>
            </Pressable>
          )}

          <Text style={styles.label}>{t('createPost.categoryLabel')}</Text>
          <View style={styles.categories}>
            {POST_CATEGORIES.map((item) => {
              const selected = category === item;
              return (
                <Pressable
                  key={item}
                  style={({ pressed }) => [
                    styles.categoryChip,
                    selected && styles.categoryChipSelected,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => setCategory(item)}
                  disabled={publishing}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selected && styles.categoryTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.publishButton,
              !canPublish && styles.publishButtonDisabled,
              pressed && canPublish && styles.pressed,
            ]}
            onPress={handlePublish}
            disabled={!canPublish}
          >
            {publishing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.publishButtonText}>
                {isEditing ? t('createPost.save') : t('createPost.publish')}
              </Text>
            )}
          </Pressable>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    flex: { flex: 1 },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    headerSpacer: {
      width: 88,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingRight: 8,
      minWidth: 88,
    },
    backIcon: {
      fontSize: 20,
      color: colors.accent,
      marginRight: 4,
    },
    backLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.accent,
    },
    title: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
    },
    publishButton: {
      backgroundColor: '#2563EB',
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 14,
      minWidth: 88,
      alignItems: 'center',
      marginTop: 16,
    },
    publishButtonDisabled: {
      backgroundColor: colors.border,
    },
    publishButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    body: {
      padding: 20,
      paddingBottom: 32,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      lineHeight: 22,
      color: colors.text,
      minHeight: 140,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    inputError: {
      borderColor: '#EF4444',
    },
    attachButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.surface,
      borderRadius: 14,
      paddingVertical: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
    },
    attachButtonIcon: {
      fontSize: 20,
    },
    attachButtonText: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.accent,
    },
    imagePreviewWrap: {
      marginBottom: 24,
    },
    imagePreview: {
      width: '100%',
      height: 220,
      borderRadius: 14,
      backgroundColor: colors.surface,
    },
    removeImageButton: {
      alignSelf: 'flex-start',
      marginTop: 10,
      paddingVertical: 6,
      paddingHorizontal: 4,
    },
    removeImageText: {
      fontSize: 14,
      fontWeight: '500',
      color: '#EF4444',
    },
    categories: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    categoryChip: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryChipSelected: {
      backgroundColor: colors.accentSoft,
      borderColor: colors.accent,
    },
    categoryText: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    categoryTextSelected: {
      color: colors.accent,
      fontWeight: '600',
    },
    errorText: {
      marginTop: 16,
      fontSize: 14,
      color: '#EF4444',
    },
    pressed: {
      opacity: 0.7,
    },
  });
}
