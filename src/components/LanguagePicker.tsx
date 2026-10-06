import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { LOCALES, useI18n, type Locale } from '@/i18n';
import { radius, sans, spacing, useTheme, type Colors } from '@/theme';

interface Props {
  style?: StyleProp<ViewStyle>;
}

/**
 * Segmented control for English / Kinyarwanda / French.
 * Used on the login screen and the FixPoints screen so the app can be
 * read in any language before or after signing in.
 */
export function LanguagePicker({ style }: Props) {
  const { locale, setLocale } = useI18n();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <View style={[styles.row, style]}>
      {LOCALES.map((item) => {
        const active = locale === item.id;
        return (
          <Pressable
            key={item.id}
            onPress={() => setLocale(item.id as Locale)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={item.label}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignSelf: 'center',
      padding: 4,
      gap: 4,
      borderRadius: radius.pill,
      backgroundColor: colors.sage,
    },
    segment: {
      minHeight: 40,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    segmentActive: { backgroundColor: colors.brand },
    label: { ...sans.buttonSmall, color: colors.text },
    labelActive: { color: colors.white },
  });
