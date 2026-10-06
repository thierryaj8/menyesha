import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { TrafficDocument, TrafficDocCategory } from '@/types';
import { HIT_SIZE, radius, sans, spacing, useTheme, type Colors } from '@/theme';
import { useT } from '@/i18n';

interface TrafficDocCardProps {
  item: TrafficDocument;
  onPress: () => void;
}

const CATEGORY_ICON: Record<TrafficDocCategory, string> = {
  driving_licences: 'card',
  road_signs: 'navigate',
  vehicle_regulations: 'car',
  pedestrian_safety: 'walk',
  public_transport: 'bus',
  traffic_offences: 'warning',
};

const LANG_LABEL: Record<string, string> = {
  en: 'EN',
  rw: 'RW',
  fr: 'FR',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function TrafficDocCard({ item, onPress }: TrafficDocCardProps) {
  const { colors } = useTheme();
  const t = useT();
  const styles = makeStyles(colors);

  const icon = CATEGORY_ICON[item.category] ?? 'document-text';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={item.title}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={icon as any} size={20} color={colors.brand} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.authority} numberOfLines={1}>{item.issuingAuthority}</Text>
        <View style={styles.metaRow}>
          <View style={styles.langBadge}>
            <Text style={styles.langText}>{LANG_LABEL[item.language] ?? item.language}</Text>
          </View>
          <Text style={styles.meta}>v{item.version}</Text>
          {item.revisedAt ? (
            <Text style={styles.meta}>{t('traffic.revised')}: {formatDate(item.revisedAt)}</Text>
          ) : (
            <Text style={styles.meta}>{formatDate(item.publishedAt)}</Text>
          )}
          {item.pdfUrl && (
            <View style={styles.pdfBadge}>
              <Ionicons name="document" size={11} color={colors.accent} />
              <Text style={styles.pdfText}>PDF</Text>
            </View>
          )}
        </View>
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
    body: { flex: 1, gap: 4 },
    title: {
      ...sans.label,
      color: colors.text,
    },
    authority: {
      ...sans.small,
      color: colors.textMuted,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      flexWrap: 'wrap',
      marginTop: 2,
    },
    langBadge: {
      backgroundColor: colors.brandSoft,
      borderRadius: radius.pill,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    langText: {
      ...sans.tiny,
      color: colors.brand,
      letterSpacing: 0.5,
    },
    meta: {
      ...sans.tiny,
      color: colors.textFaint,
    },
    pdfBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: colors.accentSoft,
      borderRadius: radius.pill,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    pdfText: {
      ...sans.tiny,
      color: colors.accent,
      letterSpacing: 0.5,
    },
    chevron: { alignSelf: 'center', flexShrink: 0 },
  });
