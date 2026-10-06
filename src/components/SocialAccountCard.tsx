import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import type { OfficialAccount, SocialPlatform } from '@/types';
import { HIT_SIZE, radius, sans, spacing, useTheme, type Colors } from '@/theme';
import { useT } from '@/i18n';

interface SocialAccountCardProps {
  item: OfficialAccount;
}

const PLATFORM_ICON: Record<SocialPlatform, string> = {
  youtube: 'logo-youtube',
  facebook: 'logo-facebook',
  instagram: 'logo-instagram',
  x: 'logo-twitter',
  tiktok: 'logo-tiktok',
};

const PLATFORM_COLOR: Record<SocialPlatform, string> = {
  youtube: '#FF0000',
  facebook: '#1877F2',
  instagram: '#C13584',
  x: '#000000',
  tiktok: '#010101',
};

const PLATFORM_LABEL: Record<SocialPlatform, string> = {
  youtube: 'YouTube',
  facebook: 'Facebook',
  instagram: 'Instagram',
  x: 'X',
  tiktok: 'TikTok',
};

export function SocialAccountCard({ item }: SocialAccountCardProps) {
  const { colors } = useTheme();
  const t = useT();
  const styles = makeStyles(colors);

  const platformIcon = PLATFORM_ICON[item.platform] ?? 'globe';
  const platformColor = PLATFORM_COLOR[item.platform] ?? colors.brand;
  const platformLabel = PLATFORM_LABEL[item.platform] ?? item.platform;

  const handlePress = () => {
    Linking.openURL(item.profileUrl).catch(() => undefined);
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="link"
      accessibilityLabel={`${item.name} on ${platformLabel}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={[styles.iconWrap, { backgroundColor: platformColor + '18' }]}>
        <Ionicons name={platformIcon as any} size={22} color={platformColor} />
      </View>
      <View style={styles.body}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          {item.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={13} color={colors.accent} />
              <Text style={styles.verifiedText}>{t('police.verifiedBadge')}</Text>
            </View>
          )}
        </View>
        <Text style={styles.platform}>{platformLabel}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      </View>
      <View style={styles.openWrap}>
        <Ionicons name="open-outline" size={16} color={colors.textFaint} />
      </View>
    </Pressable>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      gap: spacing.sm,
      minHeight: HIT_SIZE,
    },
    pressed: { opacity: 0.75 },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: radius.sm,
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    },
    body: { flex: 1, gap: 3 },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      flexWrap: 'wrap',
    },
    name: {
      ...sans.label,
      color: colors.text,
    },
    verifiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: colors.accentSoft,
      borderRadius: radius.pill,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    verifiedText: {
      ...sans.tiny,
      color: colors.accent,
    },
    platform: {
      ...sans.tiny,
      color: colors.textFaint,
      letterSpacing: 0.3,
    },
    description: {
      ...sans.small,
      color: colors.textMuted,
      marginTop: 2,
    },
    openWrap: { alignSelf: 'center', flexShrink: 0 },
  });
