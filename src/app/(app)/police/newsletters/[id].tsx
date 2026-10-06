import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { ArticleCard } from '@/components/ArticleCard';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { radius, sans, serif, spacing, useTheme, type Colors } from '@/theme';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function NewsletterDetailScreen() {
  const { colors } = useTheme();
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getNewsletter, getArticle } = useApp();
  const styles = makeStyles(colors);

  const newsletter = getNewsletter(id ?? '');
  const articles = newsletter?.articleIds.map((aid) => getArticle(aid)).filter(Boolean) ?? [];

  if (!newsletter) {
    return (
      <Screen>
        <Text style={styles.notFound}>{t('detail.notFound')}</Text>
      </Screen>
    );
  }

  const openPdf = () => {
    if (newsletter.pdfUrl) {
      Linking.openURL(newsletter.pdfUrl).catch(() => undefined);
    }
  };

  return (
    <Screen
      footer={
        newsletter.pdfUrl ? (
          <Button
            label={t('newsletters.downloadPdf')}
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

      {/* Edition badge */}
      <View style={styles.editionBadge}>
        <Ionicons name="mail" size={14} color={colors.brand} />
        <Text style={styles.editionText}>{t('newsletters.edition')}: {newsletter.edition}</Text>
      </View>

      <Text style={styles.title}>{newsletter.title}</Text>

      {/* Meta */}
      <View style={styles.metaCard}>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>{t('newsletters.issuedBy')}</Text>
          <Text style={styles.metaValue}>{newsletter.department}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>{t('media.publishedBy')}</Text>
          <Text style={styles.metaValue}>{formatDate(newsletter.publishedAt)}</Text>
        </View>
      </View>

      {/* Articles in this edition */}
      {articles.length > 0 && (
        <View style={styles.articlesSection}>
          <Text style={styles.sectionTitle}>{t('newsletters.articles')}</Text>
          <View style={styles.articlesList}>
            {articles.map((article) =>
              article ? (
                <ArticleCard
                  key={article.id}
                  item={article}
                  onPress={() => router.push(`/police/media/${article.id}` as any)}
                />
              ) : null,
            )}
          </View>
        </View>
      )}

      {/* No PDF note */}
      {!newsletter.pdfUrl && (
        <View style={styles.noPdfNote}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textFaint} />
          <Text style={styles.noPdfText}>{t('newsletters.noPdf')}</Text>
        </View>
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
    editionBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.brandSoft,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      alignSelf: 'flex-start',
    },
    editionText: { ...sans.small, color: colors.brand },
    title: { ...serif.h2, color: colors.text },
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
    articlesSection: { gap: spacing.sm },
    sectionTitle: { ...sans.eyebrow, color: colors.textMuted },
    articlesList: { gap: spacing.sm },
    noPdfNote: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: colors.sage,
      borderRadius: radius.md,
      padding: spacing.sm,
    },
    noPdfText: { ...sans.small, color: colors.textMuted, flex: 1 },
    notFound: { ...sans.body, color: colors.textMuted, textAlign: 'center' },
  });
