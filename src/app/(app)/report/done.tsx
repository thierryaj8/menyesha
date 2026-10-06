import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Note } from '@/components/Note';
import { Screen } from '@/components/Screen';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { gradients, sans, serif, shadow, spacing, useTheme, type Colors } from '@/theme';

/** Step 4 — plain confirmation, and an honest answer about points. */
export default function ReportSentScreen() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getReport } = useApp();

  const report = getReport(String(id ?? ''));

  if (!report) {
    return (
      <Screen
        footer={<Button label={t('report.homeCta')} onPress={() => router.dismissAll()} />}
      >
        <Text style={styles.title}>{t('detail.notFound')}</Text>
      </Screen>
    );
  }

  const goTrack = () => {
    router.dismissAll();
    router.push(`/report/${report.id}`);
  };

  return (
    <Screen
      footer={
        <>
          <Button label={t('report.trackCta')} onPress={goTrack} />
          <Button label={t('report.homeCta')} variant="quiet" onPress={() => router.dismissAll()} />
        </>
      }
    >
      <View style={styles.hero}>
        <View style={styles.checkRing}>
          <LinearGradient
            colors={gradients.success}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.check}
          >
            <Ionicons name="checkmark" size={36} color={colors.white} />
          </LinearGradient>
        </View>
        <Text style={styles.title}>{t('report.doneTitle')}</Text>
        <Text style={styles.text}>{t('report.doneText')}</Text>
      </View>

      <Card tone="brand" style={styles.idCard}>
        <Text style={styles.idLabel}>{t('report.idLabel')}</Text>
        <Text style={styles.idValue}>{report.id}</Text>
      </Card>

      {report.duplicateOfId ? (
        <>
          <Note icon="git-merge-outline" tone="accent" title={t('dup.foundTitle')}>
            {t('dup.foundText', { id: report.duplicateOfId })}
          </Note>
          <Note icon="diamond-outline" tone="sage" title={t('dup.noPointsTitle')}>
            {t('dup.noPointsText')}
          </Note>
        </>
      ) : (
        <Note icon="sparkles-outline" tone="brand" title={t('dup.firstTitle')}>
          {t('dup.firstText')}
        </Note>
      )}
    </Screen>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  hero: { alignItems: 'center', gap: spacing.sm, paddingTop: spacing.lg },
  checkRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  check: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.raised,
  },
  title: { ...serif.h1, color: colors.text, textAlign: 'center' },
  text: { ...sans.lead, color: colors.textMuted, textAlign: 'center' },
  idCard: { alignItems: 'center', gap: 4, padding: spacing.lg },
  idLabel: { ...sans.small, color: colors.textMuted },
  idValue: { ...serif.display, fontSize: 32, lineHeight: 38, color: colors.brandForeground, letterSpacing: 1 },
});
