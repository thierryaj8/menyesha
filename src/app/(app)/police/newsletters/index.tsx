import { Ionicons } from '@expo/vector-icons';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { NewsletterCard } from '@/components/NewsletterCard';
import { Screen } from '@/components/Screen';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { sans, serif, spacing, useTheme, type Colors } from '@/theme';

export default function NewslettersScreen() {
  const { colors } = useTheme();
  const t = useT();
  const { newsletters } = useApp();
  const styles = makeStyles(colors);

  // Sort newest first
  const sorted = [...newsletters].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return (
    <Screen scroll={false}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="mail" size={22} color={colors.brand} />
          <Text style={styles.title}>{t('newsletters.title')}</Text>
        </View>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyWrap}>
            <Ionicons name="mail-open" size={40} color={colors.textFaint} />
            <Text style={styles.emptyText}>{t('newsletters.noResults')}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <NewsletterCard
            item={item}
            onPress={() => router.push(`/police/newsletters/${item.id}` as any)}
          />
        )}
      />
    </Screen>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    header: {
      paddingHorizontal: spacing.gutter,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    title: { ...serif.h2, color: colors.brand },
    list: {
      paddingHorizontal: spacing.gutter,
      paddingBottom: spacing.xl,
    },
    sep: { height: spacing.sm },
    emptyWrap: {
      alignItems: 'center',
      paddingTop: spacing.xxl,
      gap: spacing.sm,
    },
    emptyText: { ...sans.body, color: colors.textMuted, textAlign: 'center' },
  });
