import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { ReportCard } from '@/components/ReportCard';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { sans, spacing, useTheme, type Colors } from '@/theme';

export default function ReportsScreen() {
  const t = useT();
  const { myReports } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <Screen>
      <TopBar title={t('track.title')} />

      <View style={styles.container}>
        <Text style={styles.subtitle}>{t('track.subtitle')}</Text>

        {myReports.length === 0 ? (
          <Text style={styles.empty}>{t('track.empty')}</Text>
        ) : (
          <View style={styles.list}>
            {myReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onPress={() => router.push(`/report/${report.id}`)}
              />
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  container: { gap: spacing.md },
  subtitle: { ...sans.lead, color: colors.textMuted },
  empty: { ...sans.body, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
  list: { gap: spacing.sm },
});
