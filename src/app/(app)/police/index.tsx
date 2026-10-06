import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { useT } from '@/i18n';
import { HIT_SIZE, radius, sans, serif, spacing, useTheme, type Colors } from '@/theme';

interface HubCard {
  icon: string;
  titleKey: string;
  subtitleKey: string;
  route: string;
  accent?: boolean;
}

const HUB_CARDS: HubCard[] = [
  {
    icon: 'megaphone',
    titleKey: 'police.announcements',
    subtitleKey: 'police.announcementsSubtitle',
    route: '/police/announcements',
    accent: true,
  },
  {
    icon: 'car',
    titleKey: 'police.traffic',
    subtitleKey: 'police.trafficSubtitle',
    route: '/police/traffic',
  },
  {
    icon: 'flag',
    titleKey: 'police.campaigns',
    subtitleKey: 'police.campaignsSubtitle',
    route: '/police/campaigns',
  },
  {
    icon: 'newspaper',
    titleKey: 'police.media',
    subtitleKey: 'police.mediaSubtitle',
    route: '/police/media',
  },
  {
    icon: 'logo-youtube',
    titleKey: 'police.accounts',
    subtitleKey: 'police.accountsSubtitle',
    route: '/police/accounts',
  },
  {
    icon: 'mail',
    titleKey: 'police.newsletters',
    subtitleKey: 'police.newslettersSubtitle',
    route: '/police/newsletters',
  },
];

export default function PoliceHubScreen() {
  const { colors } = useTheme();
  const t = useT();
  const styles = makeStyles(colors);

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Ionicons name="shield-checkmark" size={22} color={colors.white} />
          </View>
          <View>
            <Text style={styles.wordmark}>{t('police.hubTitle')}</Text>
            <View style={styles.officialBadge}>
              <Ionicons name="checkmark-circle" size={12} color={colors.gold} />
              <Text style={styles.officialText}>{t('police.officialBadge')}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.subtitle}>{t('police.hubSubtitle')}</Text>
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {HUB_CARDS.map((card) => (
          <Pressable
            key={card.route}
            onPress={() => router.push(card.route as any)}
            accessibilityRole="button"
            accessibilityLabel={t(card.titleKey as any)}
            style={({ pressed }) => [
              styles.card,
              card.accent && styles.cardAccent,
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.cardIcon, card.accent && styles.cardIconAccent]}>
              <Ionicons
                name={card.icon as any}
                size={24}
                color={card.accent ? colors.white : colors.brand}
              />
            </View>
            <Text style={[styles.cardTitle, card.accent && styles.cardTitleAccent]}>
              {t(card.titleKey as any)}
            </Text>
            <Text style={[styles.cardSub, card.accent && styles.cardSubAccent]} numberOfLines={2}>
              {t(card.subtitleKey as any)}
            </Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    header: { gap: spacing.xs },
    logoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    logoIcon: {
      width: 40,
      height: 40,
      borderRadius: radius.sm,
      backgroundColor: colors.brand,
      justifyContent: 'center',
      alignItems: 'center',
    },
    wordmark: {
      ...serif.h2,
      color: colors.brand,
    },
    officialBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      marginTop: 1,
    },
    officialText: {
      ...sans.tiny,
      color: colors.gold,
      letterSpacing: 0.5,
    },
    subtitle: {
      ...sans.small,
      color: colors.textMuted,
      marginTop: spacing.xs,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    card: {
      width: '47.5%',
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      gap: spacing.xs,
      minHeight: HIT_SIZE * 2.8,
    },
    cardAccent: {
      backgroundColor: colors.brand,
      borderColor: 'transparent',
    },
    pressed: { opacity: 0.8 },
    cardIcon: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      backgroundColor: colors.brandSoft,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    cardIconAccent: {
      backgroundColor: 'rgba(255,255,255,0.15)',
    },
    cardTitle: {
      ...sans.label,
      color: colors.text,
    },
    cardTitleAccent: { color: colors.white },
    cardSub: {
      ...sans.tiny,
      color: colors.textMuted,
    },
    cardSubAccent: { color: 'rgba(255,255,255,0.7)' },
  });
