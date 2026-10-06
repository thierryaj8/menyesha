import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LOCALES, useI18n, useT, type Locale } from '@/i18n';
import { HIT_SIZE, radius, sans, serif, spacing, useTheme, type Colors } from '@/theme';

/**
 * Globe trigger + language sheet.
 *
 * Shared by the floating TopLanguageBar (mobile) and the desktop navigation
 * bar, so the picker behaves identically in both places.
 */
export function LanguageMenu({
  variant = 'globe',
}: {
  /** `globe` — round icon button. `inline` — pill with the language name. */
  variant?: 'globe' | 'inline';
}) {
  const { colors } = useTheme();
  const { locale, setLocale } = useI18n();
  const t = useT();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const styles = makeStyles(colors);
  const current = LOCALES.find((item) => item.id === locale) ?? LOCALES[0];

  const choose = (id: Locale) => {
    setLocale(id);
    setOpen(false);
  };

  const trigger =
    variant === 'inline' ? (
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={t('common.language')}
        style={({ pressed }) => [styles.pill, pressed && styles.triggerPressed]}
      >
        <Ionicons name="globe-outline" size={16} color={colors.brandForeground} />
        <Text style={styles.pillText}>{current.label}</Text>
      </Pressable>
    ) : (
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={t('common.language')}
        style={({ pressed }) => [styles.globe, pressed && styles.triggerPressed]}
      >
        <Ionicons name="globe-outline" size={22} color={colors.brandForeground} />
      </Pressable>
    );

  return (
    <>
      {trigger}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          {/* The sheet swallows taps so only the backdrop closes it. */}
          <Pressable
            style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}
            onPress={() => {}}
          >
            <View style={styles.handle} />
            <Text style={styles.title}>{t('common.language')}</Text>

            {LOCALES.map((item) => {
              const active = locale === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => choose(item.id as Locale)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => [
                    styles.row,
                    active && styles.rowActive,
                    pressed && !active && styles.rowPressed,
                  ]}
                >
                  <Text style={[styles.rowLabel, active && styles.rowLabelActive]}>
                    {item.label}
                  </Text>
                  {active ? (
                    <Ionicons name="checkmark" size={22} color={colors.brandForeground} />
                  ) : (
                    <View style={styles.rowSpacer} />
                  )}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    globe: {
      width: HIT_SIZE - 4,
      height: HIT_SIZE - 4,
      borderRadius: (HIT_SIZE - 4) / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      boxShadow: '0px 1px 4px rgba(30, 46, 42, 0.08)',
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      height: 40,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      backgroundColor: colors.sage,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pillText: { ...sans.tiny, color: colors.brandForeground },
    triggerPressed: { backgroundColor: colors.sage },
    backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      paddingHorizontal: spacing.gutter,
      paddingTop: spacing.sm,
      gap: spacing.xs,
      maxWidth: 640,
      width: '100%',
      alignSelf: 'center',
    },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.borderStrong,
      marginBottom: spacing.sm,
    },
    title: { ...serif.h3, color: colors.text, marginBottom: spacing.xs },
    row: {
      minHeight: HIT_SIZE,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
    },
    rowActive: { backgroundColor: colors.sage },
    rowPressed: { backgroundColor: colors.sage },
    rowLabel: { ...sans.body, color: colors.text },
    rowLabelActive: { color: colors.brandForeground, fontWeight: '600' },
    rowSpacer: { width: 22 },
  });