import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Card } from '@/components/Card';
import { Note } from '@/components/Note';
import { Screen } from '@/components/Screen';
import { StatusChip } from '@/components/StatusChip';
import { TopBar } from '@/components/TopBar';
import { getCategory, STATUSES, statusIndex } from '@/data/meta';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { sans, serif, spacing, useTheme, type Colors } from '@/theme';
import { formatDate, formatWhen } from '@/utils/format';

/** One report, explained stage by stage, in everyday words. */
export default function ReportDetailScreen() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getReport, points } = useApp();

  const report = getReport(String(id ?? ''));

  if (!report) {
    return (
      <Screen>
        <TopBar onBack={() => router.back()} />
        <Text style={styles.missing}>{t('detail.notFound')}</Text>
      </Screen>
    );
  }

  const category = getCategory(report.categoryId);
  const palette = colors.category[report.categoryId];
  const reachedIndex = statusIndex(report.status);
  const pointEntry = points.find((entry) => entry.reportId === report.id);

  return (
    <Screen>
      <TopBar onBack={() => router.back()} title={report.id} />

      <Card style={styles.head}>
        <View style={styles.headTop}>
          <View style={[styles.iconWrap, { backgroundColor: palette.bg }]}>
            <Ionicons
              name={category?.icon ?? 'alert-circle-outline'}
              size={20}
              color={palette.fg}
            />
          </View>
          <Text style={styles.category}>{category ? t(category.labelKey) : ''}</Text>
          <StatusChip status={report.status} />
        </View>
        <Text style={styles.description}>{report.description}</Text>
        <Text style={styles.meta}>
          {report.area} · {formatWhen(report.createdAt)}
        </Text>
      </Card>

      {report.duplicateOfId ? (
        <Note icon="git-merge-outline" tone="accent">
          {t('track.linked', { id: report.duplicateOfId })}
        </Note>
      ) : null}

      <Text style={styles.sectionTitle}>{t('detail.timelineTitle')}</Text>
      <Text style={styles.estimatedNote}>{t('detail.estimatedStatus')}</Text>

      <View style={styles.timeline}>
        {STATUSES.map((status, index) => {
          const reached = index <= reachedIndex;
          const current = index === reachedIndex;
          const isLast = index === STATUSES.length - 1;
          const entry = report.timeline.find((item) => item.status === status.id);

          return (
            <View key={status.id} style={styles.step}>
              <View style={styles.rail}>
                <View
                  style={[
                    styles.dot,
                    reached && styles.dotDone,
                    current && styles.dotCurrent,
                  ]}
                >
                  <Ionicons
                    name={status.icon}
                    size={11}
                    color={reached ? colors.white : colors.textFaint}
                  />
                </View>
                {!isLast ? (
                  <View style={[styles.line, index < reachedIndex && styles.lineDone]} />
                ) : null}
              </View>

              <View style={styles.stepBody}>
                <View style={styles.stepHead}>
                  <Text
                    style={[
                      styles.stepLabel,
                      current && styles.stepLabelNow,
                      !reached && styles.stepLabelIdle,
                    ]}
                  >
                    {t(status.labelKey)}
                  </Text>
                  <Text style={styles.stepDate}>
                    {entry ? formatDate(entry.date) : t('detail.notYet')}
                  </Text>
                </View>
                <Text style={styles.stepMeaning}>{t(status.meaningKey)}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {!report.pointsEligible ? (
        <Note icon="diamond-outline" tone="sage" title={t('dup.noPointsTitle')}>
          {t('dup.noPointsText')}
        </Note>
      ) : pointEntry?.status === 'confirmed' ? (
        <Note icon="sparkles-outline" tone="accent" title={t('rewards.status.confirmed')}>
          {t('detail.ptsEarned', { points: pointEntry.points })}
        </Note>
      ) : (
        <Note icon="time-outline" tone="sage" title={t('rewards.status.pending')}>
          {t('detail.ptsWaiting')}
        </Note>
      )}

      <Card style={styles.locationCard}>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={16} color={colors.accent} />
          <Text style={styles.locationText}>{report.area}</Text>
        </View>
        <Text style={styles.privacyNote}>{t('detail.privacy')}</Text>
      </Card>
    </Screen>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  missing: { ...serif.h3, color: colors.text, textAlign: 'center', marginTop: spacing.xl },
  head: { gap: spacing.sm, padding: spacing.md },
  headTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  category: { ...sans.label, color: colors.text, flex: 1 },
  description: { ...sans.lead, color: colors.text },
  meta: { ...sans.small, color: colors.textMuted },
  sectionTitle: { ...serif.h2, color: colors.text, marginTop: spacing.sm },
  estimatedNote: { ...sans.small, color: colors.textMuted, marginBottom: spacing.sm },

  timeline: { gap: 0 },
  step: { flexDirection: 'row', gap: spacing.sm },
  rail: { width: 30, alignItems: 'center' },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: { backgroundColor: colors.brandForeground, borderColor: colors.brandForeground },
  dotCurrent: { backgroundColor: colors.accent, borderColor: colors.accent },
  line: { width: 2, flex: 1, backgroundColor: colors.border, borderRadius: 1 },
  lineDone: { backgroundColor: colors.brandForeground },
  stepBody: { flex: 1, paddingBottom: spacing.md, gap: 2 },
  stepHead: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  stepLabel: { ...sans.label, color: colors.text },
  stepLabelNow: { color: colors.ochre },
  stepLabelIdle: { color: colors.textMuted },
  stepDate: { ...sans.tiny, color: colors.textMuted },
  stepMeaning: { ...sans.small, color: colors.textMuted },

  locationCard: { gap: spacing.xs, padding: spacing.md },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  locationText: { ...sans.body, color: colors.text },
  privacyNote: { ...sans.tiny, color: colors.textFaint },
});
