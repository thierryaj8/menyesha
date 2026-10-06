import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Newsletter } from '@/types';
import { HIT_SIZE, radius, sans, spacing, useTheme, type Colors } from '@/theme';
import { useT } from '@/i18n';

interface NewsletterCardProps {
  item: Newsletter;
  onPress: () => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function NewsletterCard({ item, onPress }: NewsletterCardProps) {
  const { colors } = useTheme();
  const t = useT();
  const styles = makeStyles(colors);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={item.title}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="mail" size={22} color={colors.brand} />
      </View>
      <View style={styles.body}>
        <Text style={styles.edition}>{item.edition}</Text>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.dept} numberOfLines={1}>{item.department}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{formatDate(item.publishedAt)}</Text>
          {item.pdfUrl && (
            <View style={styles.pdfBadge}>
              <Ionicons name="document" size={11} color={colors.accent} />
              <Text style={styles.pdfText}>{t('newsletters.downloadPdf')}</Text>
            </View>
          )}
          <Text style={styles.meta}>
            {item.articleIds.length} {item.articleIds.length === 1 ? 'article' : 'articles'}
          </Text>
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
      width: 44,
      height: 44,
      borderRadius: radius.sm,
      backgroundColor: colors.brandSoft,
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    },
    body: { flex: 1, gap: 3 },
    edition: {
      ...sans.eyebrow,
      color: colors.gold,
    },
    title: {
      ...sans.label,
      color: colors.text,
      lineHeight: 20,
    },
    dept: {
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
    },
    chevron: { alignSelf: 'center', flexShrink: 0 },
  });
