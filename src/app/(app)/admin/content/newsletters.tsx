/**
 * Admin › Content Management › Newsletters
 */
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { TopBar } from '@/components/TopBar';
import { AdminCrudModal, type CrudField } from '@/components/AdminCrudModal';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { radius, sans, shadow, spacing, useTheme, type Colors } from '@/theme';
import { useState } from 'react';
import type { Newsletter } from '@/types';

export default function AdminNewslettersScreen() {
  const t = useT();
  const { newsletters, createNewsletter, updateNewsletter, deleteNewsletter } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [query, setQuery] = useState('');
  const [editor, setEditor] = useState<{ open: boolean; newsletter?: Newsletter }>({ open: false });

  const q = query.toLowerCase().trim();
  const items = newsletters
    .filter((n) => {
      if (!q) return true;
      return (
        n.title.toLowerCase().includes(q) ||
        n.edition.toLowerCase().includes(q) ||
        n.department.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  const fields = (newsletter?: Newsletter): CrudField[] => [
    { key: 'title', label: 'Title', value: newsletter?.title ?? '', placeholder: 'Newsletter title' },
    { key: 'edition', label: 'Edition', value: newsletter?.edition ?? '', placeholder: 'October 2026' },
    { key: 'department', label: 'Department', value: newsletter?.department ?? '', placeholder: 'Department name' },
    { key: 'month', label: 'Month', value: String(newsletter?.month ?? new Date().getMonth() + 1), placeholder: '1-12', keyboardType: 'numeric' },
    { key: 'year', label: 'Year', value: String(newsletter?.year ?? new Date().getFullYear()), placeholder: '2026', keyboardType: 'numeric' },
    { key: 'pdfUrl', label: 'PDF URL', value: newsletter?.pdfUrl ?? '', placeholder: 'https://example.com/newsletter.pdf' },
  ];
  const submit = (values: Record<string, string>) => {
    const month = Number(values.month);
    const year = Number(values.year);
    const input = {
      title: values.title.trim(),
      edition: values.edition.trim() || 'Edition',
      month: Number.isInteger(month) ? month : new Date().getMonth() + 1,
      year: Number.isInteger(year) ? year : new Date().getFullYear(),
      department: values.department.trim() || 'Rwanda National Police',
      publishedAt: editor.newsletter?.publishedAt ?? new Date().toISOString(),
      pdfUrl: values.pdfUrl.trim() || undefined,
      articleIds: editor.newsletter?.articleIds ?? [],
    };
    if (!input.title) return;
    if (editor.newsletter) updateNewsletter(editor.newsletter.id, input);
    else createNewsletter(input);
    setEditor({ open: false });
  };
  const remove = (newsletter: Newsletter) => Alert.alert('Delete newsletter', `Delete “${newsletter.title}”?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: () => deleteNewsletter(newsletter.id) },
  ]);

  return (
    <Screen>
      <TopBar title={t('admin.content.newsletters')} />

      <View style={styles.actionBar}>
        <SearchBar value={query} onChangeText={setQuery} placeholder={t('admin.search')} />
        <Pressable onPress={() => setEditor({ open: true })} style={({ pressed }) => [styles.createBtn, pressed && styles.pressed]}>
          <Ionicons name="add" size={20} color={colors.white} />
          <Text style={styles.createBtnText}>{t('admin.create')}</Text>
        </Pressable>
      </View>

      <Text style={styles.summary}>{items.length} editions</Text>

      <View style={styles.list}>
        {items.map((newsletter) => {
          const date = new Date(newsletter.publishedAt).toLocaleDateString('en-RW', {
            day: 'numeric', month: 'short', year: 'numeric',
          });
          return (
            <View key={newsletter.id} style={styles.row}>
              <View style={styles.deptIcon}>
                <Ionicons name="mail" size={18} color={colors.white} />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.edition}>{newsletter.edition}</Text>
                <Text style={styles.rowTitle} numberOfLines={2}>{newsletter.title}</Text>
                <Text style={styles.rowMeta}>{newsletter.department} · {date}</Text>
                <View style={styles.statsRow}>
                  <Ionicons name="document-text-outline" size={12} color={colors.textFaint} />
                  <Text style={styles.statText}>
                    {newsletter.articleIds.length} articles
                  </Text>
                  {newsletter.pdfUrl && (
                    <>
                      <Ionicons name="download-outline" size={12} color={colors.textFaint} />
                      <Text style={styles.statText}>PDF</Text>
                    </>
                  )}
                </View>
              </View>
              <View style={styles.actions}>
                <Pressable onPress={() => setEditor({ open: true, newsletter })} style={styles.actionBtn}>
                  <Ionicons name="create-outline" size={16} color={colors.brand} />
                </Pressable>
                <Pressable onPress={() => remove(newsletter)} style={styles.actionBtn}>
                  <Ionicons name="trash-outline" size={16} color={colors.emergency} />
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>

      <AdminCrudModal
        visible={editor.open}
        title={editor.newsletter ? 'Edit newsletter' : 'Create newsletter'}
        submitLabel={editor.newsletter ? 'Save changes' : 'Create newsletter'}
        initialValues={fields(editor.newsletter)}
        onClose={() => setEditor({ open: false })}
        onSubmit={submit}
      />
    </Screen>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    actionBar: {
      flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm, alignItems: 'center',
    },
    createBtn: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
      backgroundColor: colors.brand, borderRadius: radius.md,
      paddingVertical: spacing.sm, paddingHorizontal: spacing.md, flexShrink: 0,
    },
    createBtnText: { ...sans.label, color: colors.white, fontSize: 13 },
    summary: { ...sans.tiny, color: colors.textMuted, marginBottom: spacing.sm },
    list: { gap: spacing.sm },
    row: {
      flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm,
      backgroundColor: colors.surface, borderRadius: radius.md,
      borderWidth: 1, borderColor: colors.border, padding: spacing.md, ...shadow.card,
    },
    deptIcon: {
      width: 36, height: 36, borderRadius: radius.sm, backgroundColor: colors.brand,
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    rowBody: { flex: 1, gap: 3 },
    edition: { ...sans.eyebrow, color: colors.accent, fontSize: 10 },
    rowTitle: { ...sans.label, color: colors.text, fontSize: 13, lineHeight: 19 },
    rowMeta: { ...sans.tiny, color: colors.textMuted },
    statsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    statText: { ...sans.tiny, color: colors.textFaint },
    actions: { gap: spacing.xs, justifyContent: 'center' },
    actionBtn: {
      width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
      borderRadius: radius.sm, backgroundColor: colors.sage,
    },
    pressed: { opacity: 0.8 },
  });