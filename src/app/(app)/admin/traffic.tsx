/**
 * Admin › Traffic Rules Management
 * Add, edit, publish, archive traffic documents.
 */
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { FilterChips } from '@/components/FilterChips';
import { TopBar } from '@/components/TopBar';
import { AdminCrudModal, type CrudField } from '@/components/AdminCrudModal';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { runCmsMutation } from '@/utils/cms';
import { radius, sans, shadow, spacing, useTheme, type Colors } from '@/theme';
import { useState } from 'react';
import type { TrafficDocCategory, TrafficDocument } from '@/types';

type CatFilter = 'all' | TrafficDocCategory;

const LANG_LABEL: Record<string, string> = { en: 'EN', rw: 'RW', fr: 'FR' };

export default function AdminTrafficScreen() {
  const t = useT();
  const { searchTrafficDocs, createTrafficDoc, updateTrafficDoc, deleteTrafficDoc } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState<CatFilter>('all');
  const [editor, setEditor] = useState<{ open: boolean; doc?: TrafficDocument }>({ open: false });

  const filtered = searchTrafficDocs(query, catFilter === 'all' ? undefined : catFilter);

  const chips: { value: CatFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'driving_licences', label: t('traffic.filterLicences') },
    { value: 'road_signs', label: t('traffic.filterSigns') },
    { value: 'vehicle_regulations', label: t('traffic.filterVehicles') },
    { value: 'pedestrian_safety', label: t('traffic.filterPedestrian') },
    { value: 'public_transport', label: t('traffic.filterTransport') },
    { value: 'traffic_offences', label: t('traffic.filterOffences') },
  ];

  const fields = (doc?: TrafficDocument): CrudField[] => [
    { key: 'title', label: 'Title', value: doc?.title ?? '', placeholder: 'Document title' },
    { key: 'category', label: 'Category', value: doc?.category ?? 'road_signs', placeholder: 'road_signs' },
    { key: 'summary', label: 'Summary', value: doc?.summary ?? '', placeholder: 'Document summary', multiline: true },
    { key: 'issuingAuthority', label: 'Authority', value: doc?.issuingAuthority ?? '', placeholder: 'Issuing authority' },
    { key: 'language', label: 'Language', value: doc?.language ?? 'en', placeholder: 'en' },
    { key: 'version', label: 'Version', value: doc?.version ?? '1.0', placeholder: '1.0' },
    { key: 'pdfUrl', label: 'PDF URL', value: doc?.pdfUrl ?? '', placeholder: 'https://example.com/file.pdf' },
  ];
  const submit = (values: Record<string, string>) => {
    const input = {
      title: values.title.trim(),
      category: (values.category.trim() || 'road_signs') as TrafficDocCategory,
      summary: values.summary.trim(),
      pdfUrl: values.pdfUrl.trim() || undefined,
      issuingAuthority: values.issuingAuthority.trim() || 'Rwanda National Police',
      publishedAt: editor.doc?.publishedAt ?? new Date().toISOString(),
      revisedAt: editor.doc?.revisedAt ?? new Date().toISOString(),
      language: (values.language.trim() || 'en') as TrafficDocument['language'],
      version: values.version.trim() || '1.0',
    };
    if (!input.title || !input.summary || !input.issuingAuthority) return;
    void runCmsMutation(editor.doc ? 'Save traffic document' : 'Create traffic document', async () => {
      if (editor.doc) await updateTrafficDoc(editor.doc.id, input);
      else await createTrafficDoc(input);
      setEditor({ open: false });
    });
  };
  const remove = (doc: TrafficDocument) => Alert.alert('Delete traffic document', `Delete “${doc.title}”?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: () => {
      void runCmsMutation('Delete traffic document', () => deleteTrafficDoc(doc.id));
    } },
  ]);

  return (
    <Screen>
      <TopBar title={t('admin.nav.traffic')} />

      <View style={styles.actionBar}>
        <SearchBar value={query} onChangeText={setQuery} placeholder={t('admin.search')} />
        <Pressable onPress={() => setEditor({ open: true })} style={({ pressed }) => [styles.createBtn, pressed && styles.pressed]}>
          <Ionicons name="add" size={20} color={colors.white} />
          <Text style={styles.createBtnText}>{t('admin.create')}</Text>
        </Pressable>
      </View>

      <FilterChips chips={chips} selected={catFilter} onSelect={setCatFilter} />

      <Text style={styles.summary}>{filtered.length} documents</Text>

      <View style={styles.list}>
        {filtered.map((doc) => {
          const pub = new Date(doc.publishedAt).toLocaleDateString('en-RW', {
            day: 'numeric', month: 'short', year: 'numeric',
          });
          const rev = doc.revisedAt
            ? new Date(doc.revisedAt).toLocaleDateString('en-RW', { month: 'short', year: 'numeric' })
            : null;

          return (
            <View key={doc.id} style={styles.row}>
              <View style={styles.rowBody}>
                <View style={styles.rowHeader}>
                  <View style={styles.langBadge}>
                    <Text style={styles.langText}>{LANG_LABEL[doc.language] ?? doc.language}</Text>
                  </View>
                  <View style={styles.catBadge}>
                    <Text style={styles.catText}>{doc.category.replace('_', ' ')}</Text>
                  </View>
                  <Text style={styles.version}>v{doc.version}</Text>
                </View>
                <Text style={styles.rowTitle} numberOfLines={2}>{doc.title}</Text>
                <Text style={styles.rowMeta}>
                  {doc.issuingAuthority} · {t('traffic.published')} {pub}
                  {rev ? ` · ${t('traffic.revised')} ${rev}` : ''}
                </Text>
              </View>
              <View style={styles.actions}>
                <Pressable onPress={() => setEditor({ open: true, doc })} style={styles.actionBtn}>
                  <Ionicons name="create-outline" size={16} color={colors.brand} />
                </Pressable>
                <Pressable onPress={() => remove(doc)} style={[styles.actionBtn, styles.deleteAction]}>
                  <Ionicons name="trash-outline" size={16} color={colors.emergency} />
                </Pressable>
                {doc.pdfUrl && (
                  <Pressable onPress={() => {}} style={styles.actionBtn}>
                    <Ionicons name="document-outline" size={16} color={colors.textMuted} />
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}
      </View>

      <AdminCrudModal
        visible={editor.open}
        title={editor.doc ? 'Edit traffic document' : 'Create traffic document'}
        submitLabel={editor.doc ? 'Save changes' : 'Create document'}
        initialValues={fields(editor.doc)}
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
    summary: { ...sans.tiny, color: colors.textMuted, marginVertical: spacing.sm },
    list: { gap: spacing.sm },
    row: {
      flexDirection: 'row', backgroundColor: colors.surface,
      borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
      padding: spacing.md, gap: spacing.sm, ...shadow.card,
    },
    rowBody: { flex: 1, gap: spacing.xs },
    rowHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
    langBadge: {
      backgroundColor: colors.accentSoft, borderRadius: radius.pill,
      paddingHorizontal: spacing.sm, paddingVertical: 2,
    },
    langText: { ...sans.tiny, color: colors.accent, fontSize: 10 },
    catBadge: {
      backgroundColor: colors.brandSoft, borderRadius: radius.pill,
      paddingHorizontal: spacing.sm, paddingVertical: 2,
    },
    catText: { ...sans.tiny, color: colors.brand, fontSize: 10 },
    version: { ...sans.tiny, color: colors.textFaint },
    rowTitle: { ...sans.label, color: colors.text, fontSize: 13, lineHeight: 19 },
    rowMeta: { ...sans.tiny, color: colors.textMuted },
    actions: { gap: spacing.xs, justifyContent: 'center' },
    actionBtn: {
      width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
      borderRadius: radius.sm, backgroundColor: colors.sage,
    },
    deleteAction: { backgroundColor: colors.emergencySoft },
    pressed: { opacity: 0.8 },
  });
