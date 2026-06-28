import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../lib/ThemeContext';
import ShareButtons from './ShareButtons';
import CapturablePostCard from './CapturablePostCard';
import { useI18n } from '../lib/i18n';

export default function ShareSheet({ visible, onClose, post, url }) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const viewShotRef = useRef(null);
  const [imageUri, setImageUri] = useState(null);

  useEffect(() => {
    if (!visible || !post) {
      setImageUri(null);
      return;
    }

    // Небольшая задержка, чтобы скрытая карточка успела отрендериться перед снимком
    const timer = setTimeout(async () => {
      try {
        if (viewShotRef.current) {
          const uri = await viewShotRef.current.capture();
          setImageUri(uri);
        }
      } catch (error) {
        // Снимок не удался — например, в десктопном браузере react-native-view-shot
        // полагается на navigator.share, которого там может не быть.
        // На реальном телефоне (Expo Go / собранное приложение) это работает нормально.
        setImageUri(null);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [visible, post]);

  if (!post) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{t('shareSheet.title')}</Text>

          <ShareButtons
            text={[post.author, post.category].filter(Boolean).join(' · ') + '\n\n' + (post.content || '')}
            url={url}
            imageUri={imageUri}
            style={styles.buttonsRow}
          />

          <Pressable
            style={({ pressed }) => [styles.cancelButton, pressed && styles.cancelPressed]}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>{t('shareSheet.cancel')}</Text>
          </Pressable>
        </Pressable>
      </Pressable>

      {/* Скрытая карточка вне экрана — нужна только для снимка под Instagram/TikTok */}
      <View style={styles.hiddenCapture} pointerEvents="none">
        <CapturablePostCard ref={viewShotRef} post={post} />
      </View>
    </Modal>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 28,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    buttonsRow: {
      justifyContent: 'center',
      marginBottom: 16,
    },
    cancelButton: {
      paddingVertical: 14,
      alignItems: 'center',
      borderRadius: 10,
      backgroundColor: colors.pressed,
    },
    cancelPressed: {
      opacity: 0.7,
    },
    cancelText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    hiddenCapture: {
      position: 'absolute',
      top: -9999,
      left: -9999,
      opacity: 0,
    },
  });
}
