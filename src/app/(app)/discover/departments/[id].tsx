/**
 * Discover › Department detail.
 */
import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { radius, sans, serif, shadow, spacing, useTheme, type Colors } from '@/theme';

export default function DepartmentDetailScreen() {
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getDepartment } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const dept = getDepartment(id ?? '');

  if (!dept) {
    return (
      <Screen>
        <TopBar title={t('departments.title')} />
        <Text style={styles.notFound}>Department not found.</Text>
      </Screen>
    );
  }

  const TYPE_LABELS: Record<string, string> = {
    national: t('departments.type.national'),
    traffic: t('departments.type.traffic'),
    community: t('departments.type.community'),
    regional: t('departments.type.regional'),
    district: t('departments.type.district'),
    specialized: t('departments.type.specialized'),
  };

  return (
    <Screen>
      <TopBar title={dept.shortName} />

      {/* Cover */}
      <View style={styles.cover}>
        <View style={styles.coverIcon}>
          <Ionicons name="shield-checkmark" size={40} color={colors.white} />
        </View>
        <Text style={styles.coverName}>{dept.name}</Text>
        <View style={styles.badgeRow}>
          {dept.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={13} color={colors.gold} />
              <Text style={styles.verifiedText}>{t('departments.verified')}</Text>
            </View>
          )}
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{TYPE_LABELS[dept.type] ?? dept.type}</Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsCard}>
        {[
          { icon: 'newspaper', label: t('departments.posts'), count: dept.postCount },
          { icon: 'play-circle', label: t('departments.videos'), count: dept.videoCount },
          { icon: 'images', label: t('departments.photos'), count: dept.photoCount },
          { icon: 'megaphone', label: t('departments.announcements'), count: dept.announcementCount },
        ].map((s) => (
          <View key={s.label} style={styles.statItem}>
            <Ionicons name={s.icon as any} size={20} color={colors.brand} />
            <Text style={styles.statCount}>{s.count}</Text>
            <Text style={styles.statLabel} numberOfLines={1}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.body}>{dept.description}</Text>
      </View>

      {/* Location */}
      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={18} color={colors.brand} />
        <Text style={styles.infoText}>{dept.location}</Text>
      </View>

      {/* Contact */}
      {dept.contactPhone && (
        <Pressable
          onPress={() => Linking.openURL(`tel:${dept.contactPhone}`)}
          style={({ pressed }) => [styles.infoRow, pressed && styles.pressed]}
        >
          <Ionicons name="call-outline" size={18} color={colors.brand} />
          <Text style={[styles.infoText, styles.link]}>{dept.contactPhone}</Text>
        </Pressable>
      )}
      {dept.contactEmail && (
        <Pressable
          onPress={() => Linking.openURL(`mailto:${dept.contactEmail}`)}
          style={({ pressed }) => [styles.infoRow, pressed && styles.pressed]}
        >
          <Ionicons name="mail-outline" size={18} color={colors.brand} />
          <Text style={[styles.infoText, styles.link]}>{dept.contactEmail}</Text>
        </Pressable>
      )}

      {/* Website */}
      {dept.website && (
        <Pressable
          onPress={() => Linking.openURL(dept.website!)}
          accessibilityRole="link"
          style={({ pressed }) => [styles.webBtn, pressed && styles.pressed]}
        >
          <Ionicons name="globe-outline" size={18} color={colors.white} />
          <Text style={styles.webBtnText}>{t('departments.website')}</Text>
        </Pressable>
      )}

      {/* Social links */}
      {dept.socialLinks && Object.keys(dept.socialLinks).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('departments.socialLinks')}</Text>
          <View style={styles.socialRow}>
            {dept.socialLinks.facebook && (
              <SocialBtn icon="logo-facebook" url={dept.socialLinks.facebook} label="Facebook" colors={colors} />
            )}
            {dept.socialLinks.twitter && (
              <SocialBtn icon="logo-twitter" url={dept.socialLinks.twitter} label="X / Twitter" colors={colors} />
            )}
            {dept.socialLinks.youtube && (
              <SocialBtn icon="logo-youtube" url={dept.socialLinks.youtube} label="YouTube" colors={colors} />
            )}
            {dept.socialLinks.instagram && (
              <SocialBtn icon="logo-instagram" url={dept.socialLinks.instagram} label="Instagram" colors={colors} />
            )}
          </View>
        </View>
      )}
    </Screen>
  );
}

function SocialBtn({
  icon,
  url,
  label,
  colors,
}: {
  icon: string;
  url: string;
  label: string;
  colors: Colors;
}) {
  return (
    <Pressable
      onPress={() => Linking.openURL(url)}
      accessibilityRole="link"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.brandSoft,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Ionicons name={icon as any} size={22} color={colors.brand} />
    </Pressable>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    notFound: {
      ...sans.body,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: spacing.xl,
    },
    cover: {
      backgroundColor: colors.brand,
      borderRadius: radius.lg,
      padding: spacing.lg,
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    coverIcon: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: 'rgba(255,255,255,0.12)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    coverName: { ...serif.h2, color: colors.white, textAlign: 'center' },
    badgeRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    verifiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(212,160,23,0.2)',
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
    },
    verifiedText: { ...sans.tiny, color: colors.gold },
    typeBadge: {
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
    },
    typeBadgeText: { ...sans.tiny, color: 'rgba(255,255,255,0.85)' },
    statsCard: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      marginBottom: spacing.lg,
      ...shadow.card,
    },
    statItem: { flex: 1, alignItems: 'center', gap: 3 },
    statCount: { ...serif.h2, color: colors.brand },
    statLabel: { ...sans.tiny, color: colors.textMuted, textAlign: 'center' },
    section: { gap: spacing.xs, marginBottom: spacing.lg },
    sectionTitle: { ...sans.eyebrow, color: colors.textFaint, letterSpacing: 1.2 },
    body: { ...sans.body, color: colors.text },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.xs,
      marginBottom: spacing.xs,
    },
    infoText: { ...sans.body, color: colors.text },
    link: { color: colors.accent },
    webBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: colors.brand,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.lg,
    },
    webBtnText: { ...sans.label, color: colors.white },
    socialRow: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
    pressed: { opacity: 0.8 },
  });
