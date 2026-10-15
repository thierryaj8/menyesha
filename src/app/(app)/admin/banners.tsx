/**
 * Admin › Web Banners Management
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
import type { BannerLocation, BannerStatus, WebBanner } from '@/types';

type LocFilter = 'all' | BannerLocation;

const STATUS_COLORS: Record<BannerStatus, string> = {
  draft: '#64748B',
  scheduled: '#1A56DB',
  active: '#15803D',
  inactive: '#94A3B8',
  archived: '#94A3B8',
};

const LOCATION_ICONS: Record<BannerLocation, string> = {
  home: 'home-outline',
  discover: 'compass-outline',
  traffic: 'car-outline',
  news: 'newspaper-outline',
  videos: 'play-circle-outline',
  departments: 'shield-checkmark-outline',
  announcements: 'megaphone-outline',
};

export default function AdminBannersScreen() {
  const t = useT();
  const { webBanners, createWebBanner, updateWebBanner, deleteWebBanner } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [query, setQuery] = useState('');
  const [locFilter, setLocFilter] = useState<LocFilter>('all');
  const [editor, setEditor] = useState<{ open: boolean; banner?: WebBanner }>({ open: false });

  const filtered = webBanners.filter((b) => {
    const q = query.toLowerCase();
    const matchesQuery = !q || b.title.toLowerCase().includes(q) || (b.bannerText ?? '').toLowerCase().includes(q);
    const matchesLoc = locFilter === 'all' || b.location === locFilter;
    return matchesQuery && matchesLoc;
  });

  const chips: { value: LocFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'home', label: 'Home' },
    { value: 'discover', label: 'Discover' },
    { value: 'traffic', label: 'Traffic' },
    { value: 'news', label: 'News' },
    { value: 'departments', label: 'Departments' },
    { value: 'announcements', label: 'Announcements' },
  ];

  const fields = (banner?: WebBanner): CrudField[] => [
    { key: 'title', label: 'Title', value: banner?.title ?? '', placeholder: 'Banner title' },
    { key: 'imageUri', label: 'Image URL', value: banner?.imageUri ?? '', placeholder: 'https://example.com/banner.jpg', optional: true },
    { key: 'bannerText', label: 'Banner text', value: banner?.bannerText ?? '', placeholder: 'Short promotional message' },
    { key: 'location', label: 'Location', value: banner?.location ?? 'home', placeholder: 'home' },
    { key: 'status', label: 'Status', value: banner?.status ?? 'draft', placeholder: 'draft' },
    { key: 'ctaLabel', label: 'CTA label', value: banner?.ctaLabel ?? '', placeholder: 'Learn more' },
    { key: 'ctaUrl', label: 'CTA URL', value: banner?.ctaUrl ?? '', placeholder: 'https://example.com' },
  ];
  const submit = (values: Record<string, string>) => {
    const input = {
      title: values.title.trim(),
      imageUri: values.imageUri.trim() || undefined,
      bannerText: values.bannerText.trim() || undefined,
      ctaLabel: values.ctaLabel.trim() || undefined,
      ctaUrl: values.ctaUrl.trim() || undefined,
      location: (values.location.trim() || 'home') as WebBanner['location'],
      startDate: editor.banner?.startDate ?? new Date().toISOString(),
      endDate: editor.banner?.endDate ?? new Date(Date.now() + 86400000 * 30).toISOString(),
      status: (values.status.trim() || 'draft') as WebBanner['status'],
      createdBy: editor.banner?.createdBy ?? '',
    };
    if (!input.title) return;
    void runCmsMutation(editor.banner ? 'Save banner' : 'Create banner', async () => {
      if (editor.banner) await updateWebBanner(editor.banner.id, input);
      else await createWebBanner(input);
      setEditor({ open: false });
    });
  };
  const remove = (banner: WebBanner) => Alert.alert('Delete banner', `Delete “${banner.title}”?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: () => {
      void runCmsMutation('Delete banner', () => deleteWebBanner(banner.id));
    } },
  ]);

  return (
    <Screen>
      <TopBar title={t('admin.ads.banners')} />

      <View style={styles.actionBar}>
        <SearchBar value={query} onChangeText={setQuery} placeholder={t('admin.search')} />
        <Pressable onPress={() => setEditor({ open: true })} style={({ pressed }) => [styles.createBtn, pressed && styles.pressed]}>
          <Ionicons name="add" size={20} color={colors.white} />
          <Text style={styles.createBtnText}>{t('admin.ads.newBanner')}</Text>
        </Pressable>
      </View>

      <FilterChips chips={chips} selected={locFilter} onSelect={setLocFilter} />
      <Text style={styles.summary}>
        {filtered.length} banners · {webBanners.filter((b) => b.status === 'active').length} active
      </Text>

      <View style={styles.list}>
        {filtered.map((banner) => {
          const statusColor = STATUS_COLORS[banner.status];
          const start = new Date(banner.startDate).toLocaleDateString('en-RW', { month: 'short', day: 'numeric' });
          const end = new Date(banner.endDate).toLocaleDateString('en-RW', { month: 'short', day: 'numeric', year: 'numeric' });
          const locationIcon = LOCATION_ICONS[banner.location] ?? 'layers-outline';

          return (
            <View key={banner.id} style={styles.row}>
              <View style={styles.locationIcon}>
                <Ionicons name={locationIcon as any} size={20} color={colors.brand} />
              </View>
              <View style={styles.rowBody}>
                <View style={styles.rowHeader}>
                  <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                  <Text style={[styles.statusLabel, { color: statusColor }]}>
                    {banner.status.toUpperCase()}
                  </Text>
                  <View style={styles.locationBadge}>
                    <Text style={styles.locationText}>{banner.location}</Text>
                  </View>
                </View>
                <Text style={styles.rowTitle} numberOfLines={1}>{banner.title}</Text>
                {banner.bannerText && (
                  <Text style={styles.bannerText} numberOfLines={2}>{banner.bannerText}</Text>
                )}
                {banner.ctaLabel && (
                  <Text style={styles.ctaLabel}>CTA: {banner.ctaLabel}</Text>
                )}
                <Text style={styles.dates}>{start} → {end}</Text>
              </View>
              <View style={styles.actions}>
                <Pressable onPress={() => setEditor({ open: true, banner })} style={styles.actionBtn}>
                  <Ionicons name="create-outline" size={16} color={colors.brand} />
                </Pressable>
                <Pressable onPress={() => remove(banner)} style={[styles.actionBtn, styles.deleteAction]}>
                  <Ionicons name="trash-outline" size={16} color={colors.emergency} />
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>

      <AdminCrudModal
        visible={editor.open}
        title={editor.banner ? 'Edit banner' : 'Create banner'}
        submitLabel={editor.banner ? 'Save changes' : 'Create banner'}
        initialValues={fields(editor.banner)}
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
    createBtnText: { ...sans.label, color: colors.white, fontSize: 12 },
    summary: { ...sans.tiny, color: colors.textMuted, marginVertical: spacing.sm },
    list: { gap: spacing.sm },
    row: {
      flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm,
      backgroundColor: colors.surface, borderRadius: radius.md,
      borderWidth: 1, borderColor: colors.border, padding: spacing.md, ...shadow.card,
    },
    locationIcon: {
      width: 40, height: 40, borderRadius: radius.sm, backgroundColor: colors.brandSoft,
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    rowBody: { flex: 1, gap: spacing.xs },
    rowHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusLabel: { ...sans.tiny, fontSize: 10, fontFamily: 'Manrope_800ExtraBold' },
    locationBadge: {
      backgroundColor: colors.sage, borderRadius: radius.pill,
      paddingHorizontal: spacing.sm, paddingVertical: 2,
    },
    locationText: { ...sans.tiny, color: colors.textMuted, fontSize: 10 },
    rowTitle: { ...sans.label, color: colors.text, fontSize: 13 },
    bannerText: { ...sans.tiny, color: colors.textMuted },
    ctaLabel: { ...sans.tiny, color: colors.accent },
    dates: { ...sans.tiny, color: colors.textFaint },
    actions: { gap: spacing.xs, justifyContent: 'center' },
    actionBtn: {
      width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
      borderRadius: radius.sm, backgroundColor: colors.sage,
    },
    deleteAction: { backgroundColor: colors.emergencySoft },
    pressed: { opacity: 0.8 },
  });
