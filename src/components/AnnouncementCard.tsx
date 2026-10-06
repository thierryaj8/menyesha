import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { PoliceAnnouncement, AnnouncementType } from '@/types';
import { HIT_SIZE, radius, sans, spacing, useTheme, type Colors } from '@/theme';
import { useT } from '@/i18n';

interface AnnouncementCardProps {
  item: PoliceAnnouncement;
  onPress: () => void;
}

const TYPE_ICON: Record<AnnouncementType, string> = {
  press_release: 'newspaper',
  road_closure: 'warning',
  public_safety: 'shield-checkmark',
  event_notice: 'calendar',
  urgent: 'alert-circle',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function AnnouncementCard({ item, onPress }: AnnouncementCardProps) {
  const { colors } = useTheme();
  const t = useT();
  const styles = makeStyles(colors);

  const iconName = TYPE_ICON[item.type] ?? 'megaphone';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={item.headline}
      style={({ pressed }) => [styles.card, item.isUrgent && styles.urgentCard, pressed && styles.pressed]}
    >
      <View style={[styles.iconWrap, item.isUrgent && styles.iconWrapUrgent]}>
        <Ionicons
          name={iconName as any}
          size={20}
          color={item.isUrgent ? colors.white : colors.brand}
        />
      </View>
      <View style={styles.body}>
        <View style={styles.topRow}>
          {item.isUrgent && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentBadgeText}>{t('announcements.urgent')}</Text>
            </View>
          )}
          <Text style={styles.date}>{formatDate(item.publishedAt)}</Text>
        </View>
        <Text style={styles.headline} numberOfLines={2}>{item.headline}</Text>
        <Text style={styles.authority} numberOfLines={1}>{item.authority}</Text>
        {item.locations && item.locations.length > 0 && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color={colors.textFaint} />
            <Text style={styles.location} numberOfLines={1}>
              {item.locations.slice(0, 2).join(', ')}
            </Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textFaint} style={styles.chevron} />
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
    urgentCard: {
      borderColor: colors.emergency,
      backgroundColor: colors.emergencySoft,
    },
    pressed: { opacity: 0.75 },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: radius.sm,
      backgroundColor: colors.brandSoft,
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    },
    iconWrapUrgent: {
      backgroundColor: colors.emergency,
    },
    body: { flex: 1, gap: 3 },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      flexWrap: 'wrap',
    },
    urgentBadge: {
      backgroundColor: colors.emergency,
      borderRadius: radius.pill,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    urgentBadgeText: {
      ...sans.tiny,
      color: colors.white,
      letterSpacing: 0.6,
    },
    date: {
      ...sans.tiny,
      color: colors.textFaint,
    },
    headline: {
      ...sans.label,
      color: colors.text,
    },
    authority: {
      ...sans.small,
      color: colors.textMuted,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      marginTop: 2,
    },
    location: {
      ...sans.tiny,
      color: colors.textFaint,
    },
    chevron: { alignSelf: 'center', flexShrink: 0 },
  });
