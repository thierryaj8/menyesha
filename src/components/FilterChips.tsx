import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { HIT_SIZE, radius, sans, spacing, useTheme, type Colors } from '@/theme';

export interface FilterChip<T extends string> {
  value: T;
  label: string;
}

interface FilterChipsProps<T extends string> {
  chips: FilterChip<T>[];
  selected: T;
  onSelect: (value: T) => void;
}

export function FilterChips<T extends string>({ chips, selected, onSelect }: FilterChipsProps<T>) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityRole="toolbar"
    >
      {chips.map((chip) => {
        const active = chip.value === selected;
        return (
          <Pressable
            key={chip.value}
            onPress={() => onSelect(chip.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [
              styles.chip,
              active ? styles.chipActive : styles.chipInactive,
              pressed && styles.chipPressed,
            ]}
          >
            <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive]}>
              {chip.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: spacing.xs,
      paddingHorizontal: 2,
      paddingVertical: 2,
    },
    chip: {
      borderRadius: radius.pill,
      paddingHorizontal: spacing.md,
      height: 36,
      minHeight: HIT_SIZE * 0.75,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
    },
    chipActive: {
      backgroundColor: colors.brand,
      borderColor: colors.brand,
    },
    chipInactive: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    chipPressed: { opacity: 0.75 },
    label: { ...sans.label },
    labelActive: { color: colors.textOnBrand },
    labelInactive: { color: colors.textMuted },
  });
