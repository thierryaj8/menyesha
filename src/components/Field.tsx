import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
} from 'react-native';
import { fonts, radius, sans, spacing, useTheme, type Colors } from '@/theme';

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string | null;
  hint?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
  multiline?: boolean;
  maxLength?: number;
  style?: StyleProp<TextStyle>;
}

/** Label above, input below. Focus is a colored border; errors are said in plain words. */
export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  hint,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  autoComplete = 'off',
  textContentType = 'none',
  multiline,
  maxLength,
  style,
}: FieldProps) {
  const [focused, setFocused] = useState(false);
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        textContentType={textContentType}
        multiline={multiline}
        maxLength={maxLength}
        accessibilityLabel={label}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.input,
          focused && styles.inputFocused,
          multiline && styles.multiline,
          !!error && styles.inputError,
          style,
        ]}
      />
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    wrap: { gap: spacing.xs },
    label: { ...sans.label, color: colors.text },
    input: {
      minHeight: 52,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      ...sans.body,
      color: colors.text,
      fontFamily: fonts.sansMedium,
    },
    inputFocused: { borderColor: colors.brandForeground, borderWidth: 2 },
    multiline: { minHeight: 132, textAlignVertical: 'top', paddingTop: spacing.sm },
    inputError: { borderColor: colors.emergencyForeground, borderWidth: 2 },
    error: { ...sans.small, color: colors.emergencyForeground },
    hint: { ...sans.small, color: colors.textMuted },
  });
