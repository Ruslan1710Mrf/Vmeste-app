import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../lib/ThemeContext';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useI18n } from '../lib/i18n';

export default function MemberOptionsMenu({
  visible,
  onClose,
  isBlocked,
  onBlock,
  onUnblock,
  onReport,
}) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]} onPress={(e) => e.stopPropagation()}>
          <Pressable
            style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
            onPress={onReport}
          >
            <Text style={styles.optionText}>{t('memberMenu.report')}</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
            onPress={isBlocked ? onUnblock : onBlock}
          >
            <Text style={[styles.optionText, styles.destructive]}>
              {isBlocked ? t('memberMenu.unblock') : t('memberMenu.block')}
            </Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
            onPress={onClose}
          >
            <Text style={styles.cancel}>{t('memberMenu.cancel')}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = (colors) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%', maxWidth: 560, alignSelf: 'center',
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
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
});
