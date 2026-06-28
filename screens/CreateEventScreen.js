import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTheme } from '../lib/ThemeContext';
import { useI18n } from '../lib/i18n';

export default function CreateEventScreen({ onBack, onPublish }) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [city, setCity] = useState('');
  const [venue, setVenue] = useState('');
  const [description, setDescription] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');

  const canPublish = title.trim() && date.trim() && city.trim() && !publishing;

  const handlePublish = async () => {
    if (!title.trim() || !date.trim() || !city.trim()) {
      setError(t('createEvent.errorRequiredFields'));
      return;
    }

    setError('');
    setPublishing(true);
    try {
      await onPublish({
        title: title.trim(),
        date: date.trim(),
        city: city.trim(),
        venue: venue.trim(),
        description: description.trim(),
      });
    } catch (err) {
      setError(err?.message || t('createEvent.errorGeneric'));
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
            <Text style={styles.backLabel}>{t('createEvent.cancel')}</Text>
          </Pressable>
          <Text style={styles.title}>{t('createEvent.newEvent')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.label}>{t('createEvent.titleLabel')}</Text>
          <TextInput
            style={[styles.input, error && !title.trim() ? styles.inputError : null]}
            placeholder={t('createEvent.titlePlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={(value) => {
              setTitle(value);
              if (error) setError('');
            }}
            autoFocus
          />

          <Text style={styles.label}>{t('createEvent.dateLabel')}</Text>
          <TextInput
            style={[styles.input, error && !date.trim() ? styles.inputError : null]}
            placeholder={t('createEvent.datePlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={date}
            onChangeText={(value) => {
              setDate(value);
              if (error) setError('');
            }}
          />

          <Text style={styles.label}>{t('createEvent.cityLabel')}</Text>
          <TextInput
            style={[styles.input, error && !city.trim() ? styles.inputError : null]}
            placeholder={t('createEvent.cityPlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={city}
            onChangeText={(value) => {
              setCity(value);
              if (error) setError('');
            }}
          />

          <Text style={styles.label}>{t('createEvent.venueLabel')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('createEvent.venuePlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={venue}
            onChangeText={setVenue}
          />

          <Text style={styles.label}>{t('createEvent.descriptionLabel')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t('createEvent.descriptionPlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />

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
              <Text style={styles.publishButtonText}>{t('createEvent.publish')}</Text>
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
      backgroundColor: '#7C3AED',
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 8,
    },
    publishButtonDisabled: {
      backgroundColor: colors.border,
    },
    publishButtonText: {
      fontSize: 16,
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
      marginTop: 16,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    textArea: {
      minHeight: 120,
      lineHeight: 22,
    },
    inputError: {
      borderColor: '#EF4444',
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
