import { forwardRef, useState } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInput as TextInputType,
  type TextStyle,
} from 'react-native';
import { useI18n } from '../../lib/i18n';
import styles from './authStyles';

type PasswordFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  hasError?: boolean;
  textContentType?: 'password' | 'newPassword';
  inputStyle?: StyleProp<TextStyle>;
  returnKeyType?: 'next' | 'done' | 'go';
  onSubmitEditing?: () => void;
  blurOnSubmit?: boolean;
};

const PasswordField = forwardRef<TextInputType, PasswordFieldProps>(function PasswordField(
  {
    label,
    value,
    onChangeText,
    placeholder,
    hasError = false,
    textContentType = 'password',
    inputStyle,
    returnKeyType = 'next',
    onSubmitEditing,
    blurOnSubmit = false,
  },
  ref,
) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.passwordWrap, hasError && styles.passwordWrapError]}>
        <TextInput
          ref={ref}
          style={[styles.passwordInput, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!visible}
          textContentType={textContentType}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={blurOnSubmit}
        />
        <Pressable
          style={({ pressed }) => [
            styles.passwordToggle,
            pressed && styles.pressed,
          ]}
          onPress={() => setVisible((prev) => !prev)}
          accessibilityRole="button"
          accessibilityLabel={visible ? t('auth.hidePassword') : t('auth.showPassword')}
        >
          <Text style={styles.passwordToggleIcon}>{visible ? '🙈' : '👁'}</Text>
        </Pressable>
      </View>
    </View>
  );
});

export default PasswordField;
