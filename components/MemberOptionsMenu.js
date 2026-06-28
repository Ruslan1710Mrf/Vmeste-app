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
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
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

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#F8FAFC',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },
  destructive: {
    color: '#EF4444',
  },
  cancel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
});
