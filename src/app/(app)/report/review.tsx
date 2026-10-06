import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Note } from '@/components/Note';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { getCategory } from '@/data/meta';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { sans, serif, spacing, useTheme, type Colors } from '@/theme';

/** Step 3 — everything in one look, then send. */
export default function ReviewStep() {
  const t = useT();
  const { draft, submitReport } = useApp();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const category = getCategory(draft.categoryId);

  const onSend = async () => {
    setError(null);
    setSending(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    const result = await submitReport();
    setSending(false);

    if (!result.ok) {
      setError(result.errorKey ? t(result.errorKey) : t('report.errSend'));
      return;
    }

    router.dismissTo({ pathname: '/report/done', params: { id: result.reportId } });
  };

  return (
    <Screen
      footer={
        <>
          <Button
            label={sending ? t('report.sending') : t('report.submitCta')}
            onPress={onSend}
            loading={sending}
            icon={sending ? undefined : <Ionicons name="send" size={16} color={colors.white} />}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </>
      }
    >
      <TopBar onBack={() => router.back()} step={{ current: 3, total: 3 }} />

      <View>
        <Text style={styles.title}>{t('report.reviewTitle')}</Text>
        <Text style={styles.subtitle}>{t('report.reviewSubtitle')}</Text>
      </View>

      <Card style={styles.row}>
        <View style={styles.rowBody}>
          <Text style={styles.rowLabel}>{t('report.catTitle')}</Text>
          <Text style={styles.rowValue}>{category ? t(category.labelKey) : '—'}</Text>
        </View>
        <Button
          label={t('common.change')}
          variant="quiet"
          onPress={() => router.dismissTo('/report')}
          style={styles.change}
        />
      </Card>

      <Card style={styles.row}>
        <View style={styles.rowBody}>
          <Text style={styles.rowLabel}>{t('report.descLabel')}</Text>
          <Text style={styles.rowValue}>{draft.description.trim() || '—'}</Text>
        </View>
        <Button
          label={t('common.change')}
          variant="quiet"
          onPress={() => router.dismissTo('/report/details')}
          style={styles.change}
        />
      </Card>

      <Card style={styles.row}>
        <View style={styles.rowBody}>
          <Text style={styles.rowLabel}>{t('report.evidenceLabel')}</Text>
          <Text style={styles.rowValue}>
            {draft.photoUri ? draft.photoUri.split('/').pop() ?? 'media' : t('report.reviewPhoto')}
          </Text>
        </View>
        <Button
          label={t('common.change')}
          variant="quiet"
          onPress={() => router.dismissTo('/report/details')}
          style={styles.change}
        />
      </Card>

      <Card style={styles.row}>
        <View style={styles.rowBody}>
          <Text style={styles.rowLabel}>{t('report.reviewLocation')}</Text>
          <Text style={styles.rowValue}>{draft.area}</Text>
        </View>
        <Button
          label={t('common.change')}
          variant="quiet"
          onPress={() => router.dismissTo('/report/details')}
          style={styles.change}
        />
      </Card>

      <Note icon="lock-closed-outline" tone="brand">
        {t('report.locationNote')}
      </Note>
      <Note icon="shield-checkmark-outline" tone="sage">
        {t('report.privacyNote')}
      </Note>
    </Screen>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  title: { ...serif.h1, color: colors.text },
  subtitle: { ...sans.lead, color: colors.textMuted },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  rowBody: { flex: 1, gap: 3 },
  rowLabel: {
    ...sans.eyebrow,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  rowValue: { ...sans.lead, color: colors.text },
  change: { minHeight: 48, paddingHorizontal: spacing.md },
  error: { ...sans.small, color: colors.emergencyForeground, textAlign: 'center' },
});
