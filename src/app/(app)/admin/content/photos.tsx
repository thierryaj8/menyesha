/**
 * Admin › Content Management › Photos
 */
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { TopBar } from '@/components/TopBar';
import { AdminCrudModal, type CrudField } from '@/components/AdminCrudModal';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { runCmsMutation } from '@/utils/cms';
import { radius, sans, shadow, spacing, useTheme, type Colors } from '@/theme';
import { useState } from 'react';
import type { DiscoverPhoto } from '@/types';

export default function AdminPhotosScreen() {
  const t = useT();
  const { discoverPhotos, searchDiscoverPhotos, createDiscoverPhoto, updateDiscoverPhoto, deleteDiscoverPhoto } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [query, setQuery] = useState('');
  const [editor, setEditor] = useState<{ open: boolean; photo?: DiscoverPhoto }>({ open: false });

  const photos = query.trim() ? searchDiscoverPhotos(query) : discoverPhotos;
  const totalViews = photos.reduce((sum, p) => sum + p.views, 0);
  const fields = (photo?: DiscoverPhoto): CrudField[] => [
    { key: 'title', label: 'Title', value: photo?.title ?? '', placeholder: 'Photo title' },
    { key: 'departmentName', label: 'Department', value: photo?.departmentName ?? '', placeholder: 'Department name' },
    { key: 'caption', label: 'Caption', value: photo?.caption ?? '', placeholder: 'Photo caption', multiline: true },
    { key: 'imageUri', label: 'Image URL', value: photo?.imageUri ?? '', placeholder: 'https://example.com/image.jpg' },
    { key: 'tags', label: 'Tags', value: photo?.tags.join(', ') ?? '', placeholder: 'community, outreach' },
  ];
  const submit = (values: Record<string, string>) => {
    const input = {
      departmentId: editor.photo?.departmentId,
      departmentName: values.departmentName.trim() || 'Rwanda National Police',
      title: values.title.trim(),
      caption: values.caption.trim(),
      imageUri: values.imageUri.trim(),
      tags: values.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      publishedAt: editor.photo?.publishedAt ?? new Date().toISOString(),
      views: editor.photo?.views ?? 0,
      isVerified: editor.photo?.isVerified ?? true,
    };
    if (!input.title || !input.caption) return;
    void runCmsMutation(editor.photo ? 'Save photo' : 'Create photo', async () => {
      if (editor.photo) await updateDiscoverPhoto(editor.photo.id, input);
      else await createDiscoverPhoto(input);
      setEditor({ open: false });
    });
  };
  const remove = (photo: DiscoverPhoto) => Alert.alert('Delete photo', `Delete “${photo.title}”?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: () => {
      void runCmsMutation('Delete photo', () => deleteDiscoverPhoto(photo.id));
    } },
  ]);

  return (
    <Screen>
      <TopBar title={t('admin.content.photos')} />

      <View style={styles.actionBar}>
        <SearchBar value={query} onChangeText={setQuery} placeholder={t('admin.search')} />
        <Pressable onPress={() => setEditor({ open: true })} style={({ pressed }) => [styles.createBtn, pressed && styles.pressed]}>
          <Ionicons name="add" size={20} color={colors.white} />
          <Text style={styles.createBtnText}>{t('admin.create')}</Text>
        </Pressable>
      </View>

      <Text style={styles.summary}>
        {photos.length} photos · {totalViews.toLocaleString()} views
      </Text>

      <View style={styles.list}>
        {photos.map((photo) => {
          const date = new Date(photo.publishedAt).toLocaleDateString('en-RW', {
            day: 'numeric', month: 'short', year: 'numeric',
          });
          return (
            <View key={photo.id} style={styles.row}>
              <View style={styles.thumb}>
                <Ionicons name="image" size={20} color={colors.white} />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle} numberOfLines={2}>{photo.title}</Text>
                <Text style={styles.rowMeta} numberOfLines={1}>{photo.departmentName} · {date}</Text>
                <View style={styles.statsRow}>
                  <Ionicons name="eye-outline" size={12} color={colors.textFaint} />
                  <Text style={styles.statText}>{photo.views.toLocaleString()}</Text>
                  {photo.isVerified && (
                    <Ionicons name="checkmark-circle" size={12} color={colors.gold} />
                  )}
                </View>
              </View>
              <View style={styles.actions}>
                <Pressable onPress={() => setEditor({ open: true, photo })} style={styles.actionBtn}>
                  <Ionicons name="create-outline" size={16} color={colors.brand} />
                </Pressable>
                <Pressable onPress={() => remove(photo)} style={styles.actionBtn}>
                  <Ionicons name="trash-outline" size={16} color={colors.emergency} />
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>

      <AdminCrudModal
        visible={editor.open}
        title={editor.photo ? 'Edit photo' : 'Create photo'}
        submitLabel={editor.photo ? 'Save changes' : 'Create photo'}
        initialValues={fields(editor.photo)}
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
    thumb: {
      width: 56, height: 56, borderRadius: radius.sm, backgroundColor: colors.brand,
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    rowBody: { flex: 1, gap: 3 },
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