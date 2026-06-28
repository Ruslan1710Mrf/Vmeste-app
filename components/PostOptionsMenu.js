import { useMemo } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../lib/ThemeContext';
import { useI18n } from '../lib/i18n';

export default function PostOptionsMenu({
  visible,
  onClose,
  onEdit,
  onDelete,
  onReport,
}) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Pressable
            style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
            onPress={onEdit}
          >
            <Text style={styles.optionText}>{t('postMenu.editPost')}</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
            onPress={onDelete}
          >
            <Text style={[styles.optionText, styles.destructive]}>{t('postMenu.deletePost')}</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
            onPress={onReport}
          >
            <Text style={styles.optionText}>{t('postMenu.report')}</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
            onPress={onClose}
          >
            <Text style={[styles.optionText, styles.cancel]}>{t('postMenu.cancel')}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
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
      paddingBottom: 24,
      paddingTop: 8,
    },
    option: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      alignItems: 'center',
    },
    optionPressed: {
      backgroundColor: colors.pressed,
    },
    optionText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
    },
    destructive: {
      color: '#EF4444',
    },
    cancel: {
      color: colors.textSecondary,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginHorizontal: 16,
    },
  });
}
