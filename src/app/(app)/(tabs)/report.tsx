import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { CATEGORIES } from '@/data/meta';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { radius, sans, serif, spacing, useTheme, type Colors } from '@/theme';

/** Step 1 — one tap and we move on. */
export default function CategoryStep() {
  const t = useT();
  const { updateDraft } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <Screen>
      <TopBar step={{ current: 1, total: 3 }} />

      <View>
        <Text style={styles.title}>{t('report.catTitle')}</Text>
        <Text style={styles.subtitle}>{t('report.catSubtitle')}</Text>
      </View>

      <View style={styles.grid}>
        {CATEGORIES.map((category) => {
          const palette = colors.category[category.id];
          return (
            <Pressable
              key={category.id}
              onPress={() => {
                updateDraft({ categoryId: category.id });
                router.push('/report/details');
              }}
              accessibilityRole="button"
              accessibilityLabel={t(category.labelKey)}
              style={({ pressed }) => [
                styles.card,
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              ]}
            >
              <View style={[styles.iconWrap, { backgroundColor: palette.bg }]}>
                <Ionicons name={category.icon} size={22} color={palette.fg} />
              </View>
              <Text style={styles.label}>{t(category.labelKey)}</Text>
              <Text style={styles.examples}>{t(category.examplesKey)}</Text>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  title: { ...serif.h1, color: colors.text },
  subtitle: { ...sans.lead, color: colors.textMuted },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  card: {
    width: '48%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 100,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { ...sans.label, color: colors.text, textAlign: 'center', fontSize: 12 },
  examples: { ...sans.tiny, color: colors.textMuted, textAlign: 'center' },
});
