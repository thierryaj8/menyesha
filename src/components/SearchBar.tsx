import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { HIT_SIZE, radius, sans, spacing, useTheme, type Colors } from '@/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  /** Extra margin-bottom applied to the container (default 0). */
  mb?: number;
}

export function SearchBar({ value, onChangeText, placeholder, mb = 0 }: SearchBarProps) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <View style={[styles.container, mb ? { marginBottom: mb } : undefined]}>
      <Ionicons name="search" size={18} color={colors.textMuted} style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? 'Search…'}
        placeholderTextColor={colors.textFaint}
        returnKeyType="search"
        clearButtonMode="while-editing"
        autoCorrect={false}
        autoCapitalize="none"
        accessibilityLabel={placeholder ?? 'Search'}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={HIT_SIZE}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          style={styles.clear}
        >
          <Ionicons name="close-circle" size={18} color={colors.textFaint} />
        </Pressable>
      )}
    </View>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.sm,
      minHeight: HIT_SIZE,
    },
    icon: { marginRight: spacing.xs },
    input: {
      flex: 1,
      ...sans.body,
      color: colors.text,
      paddingVertical: spacing.xs,
    },
    clear: { marginLeft: spacing.xs },
  });
