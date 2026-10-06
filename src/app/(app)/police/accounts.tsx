import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SocialAccountCard } from '@/components/SocialAccountCard';
import { Screen } from '@/components/Screen';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { radius, sans, serif, spacing, useTheme, type Colors } from '@/theme';

const CATEGORY_ORDER = ['national', 'traffic', 'regional', 'unit'] as const;
type Category = (typeof CATEGORY_ORDER)[number];

const CATEGORY_TITLE: Record<Category, string> = {
  national: 'accounts.categoryNational',
  traffic: 'accounts.categoryTraffic',
  regional: 'accounts.categoryRegional',
  unit: 'accounts.categoryUnit',
};

export default function AccountsScreen() {
  const { colors } = useTheme();
  const t = useT();
  const { officialAccounts } = useApp();
  const styles = makeStyles(colors);

  return (
    <Screen>
      {/* Header */}
      <View style={styles.titleRow}>
        <Ionicons name="logo-youtube" size={22} color={colors.brand} />
        <Text style={styles.title}>{t('accounts.title')}</Text>
      </View>
      <Text style={styles.subtitle}>{t('accounts.subtitle')}</Text>

      {/* Grouped by category */}
      {CATEGORY_ORDER.map((cat) => {
        const group = officialAccounts.filter((a) => a.category === cat);
        if (group.length === 0) return null;
        return (
          <View key={cat} style={styles.group}>
            <Text style={styles.groupLabel}>{t(CATEGORY_TITLE[cat] as any)}</Text>
            <View style={styles.groupCards}>
              {group.map((account) => (
                <SocialAccountCard key={account.id} item={account} />
              ))}
            </View>
          </View>
        );
      })}

      {/* Platform note */}
      <View style={styles.note}>
        <Ionicons name="information-circle-outline" size={16} color={colors.textFaint} />
        <Text style={styles.noteText}>{t('accounts.platformNote')}</Text>
      </View>
    </Screen>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    title: { ...serif.h2, color: colors.brand },
    subtitle: { ...sans.small, color: colors.textMuted },
    group: { gap: spacing.sm },
    groupLabel: { ...sans.eyebrow, color: colors.textMuted },
    groupCards: { gap: spacing.sm },
    note: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.xs,
      backgroundColor: colors.sage,
      borderRadius: radius.md,
      padding: spacing.sm,
    },
    noteText: { ...sans.small, color: colors.textMuted, flex: 1 },
  });
