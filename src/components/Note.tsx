import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { radius, sans, serif, spacing, useTheme, type Colors } from '@/theme';

type Tone = 'brand' | 'accent' | 'emergency' | 'sage';

interface NoteProps {
  title?: string;
  children: ReactNode;
  icon?: keyof typeof Ionicons.glyphMap;
  tone?: Tone;
}

/** Short reassurance next to a form: privacy, safety, or how points work. */
export function Note({ title, children, icon, tone = 'sage' }: NoteProps) {
  const { colors } = useTheme();
  const { styles, TONES } = makeStyles(colors);
  const palette = TONES[tone];

  return (
    <View style={[styles.wrap, { backgroundColor: palette.bg }]}>
      {icon ? <Ionicons name={icon} size={20} color={palette.fg} style={styles.icon} /> : null}
      <View style={styles.body}>
        {title ? <Text style={[styles.title, { color: palette.fg }]}>{title}</Text> : null}
        <Text style={styles.text}>{children}</Text>
      </View>
    </View>
  );
}

const makeStyles = (colors: Colors) => {
  const TONES: Record<Tone, { bg: string; fg: string }> = {
    brand: { bg: colors.brandSoft, fg: colors.brandForeground },
    accent: { bg: colors.accentSoft, fg: colors.ochre },
    emergency: { bg: colors.emergencySoft, fg: colors.emergencyForeground },
    sage: { bg: colors.sage, fg: colors.textMuted },
  };

  return {
    TONES,
    styles: StyleSheet.create({
      wrap: {
        flexDirection: 'row',
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: radius.md,
        alignItems: 'flex-start',
      },
      icon: { marginTop: 1 },
      body: { flex: 1, gap: 2 },
      title: { ...sans.label },
      text: { ...sans.small, color: colors.text },
    }),
  };
};

export { serif };
