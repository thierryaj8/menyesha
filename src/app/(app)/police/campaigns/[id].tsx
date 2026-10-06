import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { radius, sans, serif, spacing, useTheme, type Colors } from '@/theme';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function CampaignDetailScreen() {
  const { colors } = useTheme();
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { campaigns, recordCampaignClick } = useApp();
  const styles = makeStyles(colors);

  const campaign = campaigns.find((c) => c.id === id);

  if (!campaign) {
    return (
      <Screen>
        <Text style={styles.notFound}>{t('detail.notFound')}</Text>
      </Screen>
    );
  }

  const handleCta = () => {
    recordCampaignClick(campaign.id);
    if (campaign.cta?.url) {
      Linking.openURL(campaign.cta.url).catch(() => undefined);
    }
  };

  return (
    <Screen
      footer={
        campaign.cta ? (
          <Button label={campaign.cta.label} onPress={handleCta} />
        ) : undefined
      }
    >
      {/* Back */}
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        style={styles.back}
      >
        <Ionicons name="arrow-back" size={22} color={colors.brand} />
        <Text style={styles.backText}>{t('common.back')}</Text>
      </Pressable>

      {/* Badges */}
      <View style={styles.badgeRow}>
        <View style={styles.officialBadge}>
          <Ionicons name="shield-checkmark" size={11} color={colors.gold} />
          <Text style={styles.officialText}>{t('campaigns.officialLabel').toUpperCase()}</Text>
        </View>
        {campaign.isActive && (
          <View style={styles.activeBadge}>
            <View style={styles.dot} />
            <Text style={styles.activeBadgeText}>ACTIVE</Text>
          </View>
        )}
      </View>

      <Text style={styles.title}>{campaign.title}</Text>
      <Text style={styles.desc}>{campaign.description}</Text>

      {/* Details */}
      <View style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('campaigns.topic')}</Text>
          <Text style={styles.detailValue}>{campaign.topic}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('campaigns.startsOn')}</Text>
          <Text style={styles.detailValue}>{formatDate(campaign.startsAt)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('campaigns.endsOn')}</Text>
          <Text style={styles.detailValue}>{formatDate(campaign.endsAt)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('campaigns.engagement', { views: '', clicks: '' }).split('·')[0].trim()}</Text>
          <Text style={styles.detailValue}>{campaign.views.toLocaleString()} views</Text>
        </View>
      </View>
    </Screen>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    back: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    backText: { ...sans.label, color: colors.brand },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      flexWrap: 'wrap',
    },
    officialBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.brand,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
    },
    officialText: { ...sans.tiny, color: colors.gold, letterSpacing: 0.8 },
    activeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: colors.successSoft,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
    },
    dot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: colors.success,
    },
    activeBadgeText: { ...sans.tiny, color: colors.success, letterSpacing: 0.5 },
    title: { ...serif.h2, color: colors.text },
    desc: { ...sans.body, color: colors.textMuted, lineHeight: 26 },
    detailsCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: spacing.md,
      gap: spacing.sm,
    },
    detailLabel: { ...sans.label, color: colors.textMuted },
    detailValue: { ...sans.body, color: colors.text, textAlign: 'right' },
    divider: { height: 1, backgroundColor: colors.border },
    notFound: { ...sans.body, color: colors.textMuted, textAlign: 'center' },
  });
