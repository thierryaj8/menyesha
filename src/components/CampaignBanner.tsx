import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Campaign } from '@/types';
import { radius, sans, serif, spacing, useTheme, type Colors } from '@/theme';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';

interface CampaignBannerProps {
  campaign: Campaign;
}

export function CampaignBanner({ campaign }: CampaignBannerProps) {
  const { colors } = useTheme();
  const t = useT();
  const { recordCampaignView, recordCampaignClick } = useApp();
  const styles = makeStyles(colors);

  // Record a view when the banner is rendered
  // (in a real app this would be an impression callback)

  const handleCtaPress = () => {
    recordCampaignClick(campaign.id);
    if (campaign.cta?.url) {
      Linking.openURL(campaign.cta.url).catch(() => undefined);
    }
  };

  return (
    <View
      style={styles.banner}
      accessibilityRole="none"
      onLayout={() => recordCampaignView(campaign.id)}
    >
      {/* Official badge */}
      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <Ionicons name="shield-checkmark" size={11} color={colors.gold} />
          <Text style={styles.badgeText}>{t('campaigns.officialLabel').toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.title}>{campaign.title}</Text>
      <Text style={styles.description} numberOfLines={3}>{campaign.description}</Text>

      {campaign.cta && (
        <Pressable
          onPress={handleCtaPress}
          accessibilityRole="button"
          accessibilityLabel={campaign.cta.label}
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        >
          <Text style={styles.ctaText}>{campaign.cta.label}</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.brand} />
        </Pressable>
      )}
    </View>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    banner: {
      backgroundColor: colors.brandSoft,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      gap: spacing.xs,
    },
    badgeRow: {
      flexDirection: 'row',
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.brand,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      alignSelf: 'flex-start',
    },
    badgeText: {
      ...sans.tiny,
      color: colors.gold,
      letterSpacing: 0.8,
    },
    title: {
      ...serif.h3,
      color: colors.brand,
      marginTop: 2,
    },
    description: {
      ...sans.small,
      color: colors.textMuted,
      lineHeight: 20,
    },
    cta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'flex-start',
      marginTop: spacing.xs,
    },
    ctaPressed: { opacity: 0.7 },
    ctaText: {
      ...sans.label,
      color: colors.brand,
    },
  });
