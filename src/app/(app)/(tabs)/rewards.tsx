import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { Card } from '@/components/Card';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { HIT_SIZE, radius, sans, serif, spacing, useTheme, type Colors } from '@/theme';

export default function RewardsScreen() {
  const t = useT();
  const { balance } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const earnItems = [
    { icon: 'checkmark-circle', label: t('rewards.earnVerified'), points: '+50' },
    { icon: 'camera', label: t('rewards.earnEvidence'), points: '+25' },
    { icon: 'information-circle', label: t('rewards.earnInfo'), points: '+15' },
  ];

  const redeemItems = [
    { icon: 'phone-portrait', label: t('rewards.redeemMobile'), points: '500 pts' },
    { icon: 'gift', label: t('rewards.redeemApproved'), points: '1000 pts' },
    { icon: 'people', label: t('rewards.redeemCommunity'), points: '200 pts' },
  ];

  return (
    <Screen>
      <TopBar title={t('rewards.title')} />

      <View style={styles.container}>
        {/* Points balance */}
        <Card tone="brand" style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>{t('rewards.points')}</Text>
          <Text style={styles.balancePoints}>{balance.toLocaleString()}</Text>
          <Text style={styles.balanceProgress}>{t('rewards.progress')}</Text>
        </Card>

        {/* Earn points */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('rewards.earnTitle')}</Text>
          <View style={styles.itemsList}>
            {earnItems.map((item, i) => (
              <View key={i} style={styles.itemRow}>
                <View style={styles.itemIcon}>
                  <Ionicons name={item.icon as any} size={18} color={colors.accent} />
                </View>
                <Text style={styles.itemLabel}>{item.label}</Text>
                <Text style={styles.itemPoints}>{item.points}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Redeem */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('rewards.redeemTitle')}</Text>
          <View style={styles.itemsList}>
            {redeemItems.map((item, i) => (
              <Pressable
                key={i}
                style={({ pressed }) => [styles.itemRow, pressed && styles.pressed]}
                accessibilityRole="button"
              >
                <View style={styles.itemIcon}>
                  <Ionicons name={item.icon as any} size={18} color={colors.gold} />
                </View>
                <Text style={styles.itemLabel}>{item.label}</Text>
                <Text style={styles.itemPoints}>{item.points}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Anti-abuse notice */}
        <Card tone="emergency" style={styles.noticeCard}>
          <View style={styles.noticeRow}>
            <Ionicons name="warning" size={16} color={colors.emergencyForeground} />
            <Text style={styles.noticeText}>{t('rewards.antiAbuse')}</Text>
          </View>
        </Card>
      </View>
    </Screen>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  container: { gap: spacing.md },
  balanceCard: {
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.xs,
  },
  balanceLabel: { ...sans.eyebrow, color: colors.gold, letterSpacing: 1.6 },
  balancePoints: { ...serif.display, color: colors.white },
  balanceProgress: { ...sans.small, color: 'rgba(255,255,255,0.75)' },
  section: { gap: spacing.sm },
  sectionTitle: { ...serif.h3, color: colors.text },
  itemsList: { gap: spacing.xs },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: HIT_SIZE,
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: { ...sans.body, color: colors.text, flex: 1 },
  itemPoints: { ...sans.buttonSmall, color: colors.accent },
  noticeCard: { padding: spacing.md },
  noticeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  noticeText: { ...sans.small, color: colors.emergencyForeground, flex: 1 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
});
