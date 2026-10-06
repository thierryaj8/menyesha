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

export default function TrafficDocDetailScreen() {
  const { colors } = useTheme();
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTrafficDoc } = useApp();
  const styles = makeStyles(colors);

  const doc = getTrafficDoc(id ?? '');

  if (!doc) {
    return (
      <Screen>
        <Text style={styles.notFound}>{t('detail.notFound')}</Text>
      </Screen>
    );
  }

  const openPdf = () => {
    if (doc.pdfUrl) {
      Linking.openURL(doc.pdfUrl).catch(() => undefined);
    }
  };

  return (
    <Screen
      footer={
        doc.pdfUrl ? (
          <Button
            label={t('traffic.download')}
            onPress={openPdf}
            icon={<Ionicons name="download" size={18} color="#fff" />}
          />
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

      {/* Badge row */}
      <View style={styles.badgeRow}>
        <View style={styles.catBadge}>
          <Text style={styles.catText}>
            {doc.category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </Text>
        </View>
        <View style={styles.langBadge}>
          <Text style={styles.langText}>{doc.language.toUpperCase()}</Text>
        </View>
        <View style={styles.verBadge}>
          <Text style={styles.verText}>{t('traffic.version')} {doc.version}</Text>
        </View>
      </View>

      <Text style={styles.title}>{doc.title}</Text>
      <Text style={styles.summary}>{doc.summary}</Text>

      {/* Meta */}
      <View style={styles.metaCard}>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>{t('traffic.issuedBy')}</Text>
          <Text style={styles.metaValue}>{doc.issuingAuthority}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>{t('traffic.published')}</Text>
          <Text style={styles.metaValue}>{formatDate(doc.publishedAt)}</Text>
        </View>
        {doc.revisedAt && (
          <>
            <View style={styles.divider} />
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>{t('traffic.revised')}</Text>
              <Text style={styles.metaValue}>{formatDate(doc.revisedAt)}</Text>
            </View>
          </>
        )}
      </View>

      {/* PDF note */}
      {!doc.pdfUrl && (
        <View style={styles.noPdfNote}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textFaint} />
          <Text style={styles.noPdfText}>{t('traffic.noPdf')}</Text>
        </View>
      )}

      {/* Source link */}
      {doc.sourceUrl && (
        <Pressable
          onPress={() => Linking.openURL(doc.sourceUrl!).catch(() => undefined)}
          accessibilityRole="link"
          style={({ pressed }) => [styles.sourceBtn, pressed && styles.pressed]}
        >
          <Ionicons name="open-outline" size={16} color={colors.accent} />
          <Text style={styles.sourceBtnText}>{t('traffic.viewSource')}</Text>
        </Pressable>
      )}
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
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    catBadge: {
      backgroundColor: colors.brandSoft,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
    },
    catText: { ...sans.tiny, color: colors.brand },
    langBadge: {
      backgroundColor: colors.goldSoft,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
    },
    langText: { ...sans.tiny, color: colors.gold },
    verBadge: {
      backgroundColor: colors.sage,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
    },
    verText: { ...sans.tiny, color: colors.textMuted },
    title: { ...serif.h2, color: colors.text },
    summary: { ...sans.lead, color: colors.textMuted },
    metaCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: spacing.md,
      gap: spacing.sm,
    },
    metaLabel: { ...sans.label, color: colors.textMuted, flex: 1 },
    metaValue: { ...sans.body, color: colors.text, flex: 2, textAlign: 'right' },
    divider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.md },
    noPdfNote: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: colors.sage,
      borderRadius: radius.md,
      padding: spacing.sm,
    },
    noPdfText: { ...sans.small, color: colors.textMuted },
    sourceBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      alignSelf: 'flex-start',
      backgroundColor: colors.accentSoft,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    pressed: { opacity: 0.75 },
    sourceBtnText: { ...sans.label, color: colors.accent },
    notFound: { ...sans.body, color: colors.textMuted, textAlign: 'center' },
  });
