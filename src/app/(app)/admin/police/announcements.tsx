/**
 * Admin › Police Management › Announcements
 * Create, edit, publish/unpublish, archive official police announcements.
 */
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { TopBar } from '@/components/TopBar';
import { FilterChips } from '@/components/FilterChips';
import { AdminCrudModal, type CrudField } from '@/components/AdminCrudModal';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { radius, sans, shadow, spacing, useTheme, type Colors } from '@/theme';
import { runCmsMutation } from '@/utils/cms';
import { useState } from 'react';
import type { AnnouncementType, PoliceAnnouncement } from '@/types';

type Filter = 'all' | AnnouncementType;

const TYPE_COLORS: Record<AnnouncementType, string> = {
  urgent: '#B91C1C',
  public_safety: '#D97706',
  road_closure: '#1A56DB',
  press_release: '#0A1F44',
  event_notice: '#7C3AED',
};

export default function AdminAnnouncementsScreen() {
  const t = useT();
  const { searchAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [editor, setEditor] = useState<{ open: boolean; announcement?: PoliceAnnouncement }>({ open: false });

  const filtered = searchAnnouncements(
    query,
    filter === 'all' ? undefined : filter,
  );

  const chips = [
    { value: 'all' as Filter, label: 'All' },
    { value: 'urgent' as Filter, label: t('announcements.filterAll') },
    { value: 'press_release' as Filter, label: t('announcements.filterPress') },
    { value: 'road_closure' as Filter, label: t('announcements.filterRoad') },
    { value: 'public_safety' as Filter, label: t('announcements.filterSafety') },
    { value: 'event_notice' as Filter, label: t('announcements.filterEvent') },
  ];

  const fields = (announcement?: PoliceAnnouncement): CrudField[] => [
    { key: 'headline', label: 'Headline', value: announcement?.headline ?? '', placeholder: 'Announcement headline' },
    { key: 'type', label: 'Type', value: announcement?.type ?? 'public_safety', placeholder: 'public_safety' },
    { key: 'authority', label: 'Authority', value: announcement?.authority ?? '', placeholder: 'Department name' },
    { key: 'body', label: 'Message', value: announcement?.body ?? '', placeholder: 'Full announcement message', multiline: true },
    { key: 'locations', label: 'Locations', value: announcement?.locations?.join(', ') ?? '', placeholder: 'Kigali, Nyarugenge' },
  ];
  const submit = (values: Record<string, string>) => {
    const input = {
      type: (values.type.trim() || 'public_safety') as AnnouncementType,
      headline: values.headline.trim(),
      body: values.body.trim(),
      authority: values.authority.trim() || 'Rwanda National Police',
      publishedAt: editor.announcement?.publishedAt ?? new Date().toISOString(),
      locations: values.locations.split(',').map((value) => value.trim()).filter(Boolean),
      isUrgent: editor.announcement?.isUrgent ?? false,
    };
    if (!input.headline || !input.body) return;
    void runCmsMutation(editor.announcement ? 'Save announcement' : 'Create announcement', async () => {
      if (editor.announcement) await updateAnnouncement(editor.announcement.id, input);
      else await createAnnouncement(input);
      setEditor({ open: false });
    });
  };
  const remove = (announcement: PoliceAnnouncement) => Alert.alert('Delete announcement', `Delete “${announcement.headline}”?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: () => {
      void runCmsMutation('Delete announcement', () => deleteAnnouncement(announcement.id));
    } },
  ]);

  return (
    <Screen>
      <TopBar title={t('admin.police.announcements')} />

      <View style={styles.actionBar}>
        <SearchBar value={query} onChangeText={setQuery} placeholder={t('admin.search')} />
        <Pressable
          onPress={() => setEditor({ open: true })}
          style={({ pressed }) => [styles.createBtn, pressed && styles.pressed]}
        >
          <Ionicons name="add" size={20} color={colors.white} />
          <Text style={styles.createBtnText}>{t('admin.create')}</Text>
        </Pressable>
      </View>

      <FilterChips chips={chips} selected={filter} onSelect={setFilter} />

      <Text style={styles.summary}>
        {filtered.length} {t('admin.stat.announcements').toLowerCase()}
      </Text>

      <View style={styles.list}>
        {filtered.map((ann) => {
          const typeColor = TYPE_COLORS[ann.type] ?? colors.brand;
          const date = new Date(ann.publishedAt).toLocaleDateString('en-RW', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });

          return (
            <View key={ann.id} style={styles.row}>
              <View style={[styles.typeStripe, { backgroundColor: typeColor }]} />
              <View style={styles.rowBody}>
                <View style={styles.rowHeader}>
                  {ann.isUrgent && (
                    <View style={styles.urgentBadge}>
                      <Text style={styles.urgentText}>{t('announcements.urgent')}</Text>
                    </View>
                  )}
                  <View style={[styles.typeBadge, { borderColor: typeColor }]}>
                    <Text style={[styles.typeText, { color: typeColor }]}>
                      {ann.type.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.headline} numberOfLines={2}>{ann.headline}</Text>
                <Text style={styles.meta}>{ann.authority} · {date}</Text>
              </View>
              <View style={styles.actions}>
                <Pressable onPress={() => setEditor({ open: true, announcement: ann })} style={styles.actionBtn}>
                  <Ionicons name="create-outline" size={16} color={colors.brand} />
                </Pressable>
                <Pressable onPress={() => remove(ann)} style={styles.actionBtn}>
                  <Ionicons name="trash-outline" size={16} color={colors.emergency} />
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>

      <AdminCrudModal
        visible={editor.open}
        title={editor.announcement ? 'Edit announcement' : 'Create announcement'}
        submitLabel={editor.announcement ? 'Save changes' : 'Create announcement'}
        initialValues={fields(editor.announcement)}
        onClose={() => setEditor({ open: false })}
        onSubmit={submit}
      />
    </Screen>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    actionBar: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.sm,
      alignItems: 'center',
    },
    createBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: colors.brand,
      borderRadius: radius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      flexShrink: 0,
    },
    createBtnText: { ...sans.label, color: colors.white, fontSize: 13 },
    summary: { ...sans.tiny, color: colors.textMuted, marginVertical: spacing.sm },
    list: { gap: spacing.sm },
    row: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      ...shadow.card,
    },
    typeStripe: { width: 4 },
    rowBody: { flex: 1, padding: spacing.md, gap: spacing.xs },
    rowHeader: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center', flexWrap: 'wrap' },
    urgentBadge: {
      backgroundColor: '#FEE2E2',
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    urgentText: {
      fontFamily: 'Manrope_800ExtraBold',
      fontSize: 9,
      color: '#B91C1C',
      letterSpacing: 0.5,
    },
    typeBadge: {
      borderWidth: 1,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    typeText: { ...sans.tiny, fontSize: 9 },
    headline: { ...sans.label, color: colors.text, fontSize: 13, lineHeight: 19 },
    meta: { ...sans.tiny, color: colors.textMuted },
    actions: {
      padding: spacing.sm,
      gap: spacing.xs,
      justifyContent: 'center',
    },
    actionBtn: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.sm,
      backgroundColor: colors.sage,
    },
    pressed: { opacity: 0.8 },
  });
