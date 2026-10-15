/**
 * Admin › Content Management › Videos
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
import type { DiscoverVideo } from '@/types';

export default function AdminVideosScreen() {
  const t = useT();
  const { discoverVideos, searchDiscoverVideos, createDiscoverVideo, updateDiscoverVideo, deleteDiscoverVideo } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [query, setQuery] = useState('');
  const [editor, setEditor] = useState<{ open: boolean; video?: DiscoverVideo }>({ open: false });

  const videos = query.trim() ? searchDiscoverVideos(query) : discoverVideos;
  const totalViews = videos.reduce((sum, v) => sum + v.views, 0);
  const fields = (video?: DiscoverVideo): CrudField[] => [
    { key: 'title', label: 'Title', value: video?.title ?? '', placeholder: 'Video title' },
    { key: 'departmentName', label: 'Department', value: video?.departmentName ?? '', placeholder: 'Department name' },
    { key: 'description', label: 'Description', value: video?.description ?? '', placeholder: 'Video summary', multiline: true },
    { key: 'duration', label: 'Duration', value: video?.duration ?? '', placeholder: '4:32' },
    { key: 'youtubeUrl', label: 'YouTube URL', value: video?.youtubeUrl ?? '', placeholder: 'https://youtu.be/...' },
  ];
  const submit = (values: Record<string, string>) => {
    const input = {
      departmentId: editor.video?.departmentId,
      departmentName: values.departmentName.trim() || 'Rwanda National Police',
      title: values.title.trim(),
      description: values.description.trim(),
      thumbnailUri: editor.video?.thumbnailUri,
      youtubeUrl: values.youtubeUrl.trim() || undefined,
      duration: values.duration.trim() || undefined,
      publishedAt: editor.video?.publishedAt ?? new Date().toISOString(),
      views: editor.video?.views ?? 0,
      isVerified: editor.video?.isVerified ?? true,
    };
    if (!input.title || !input.description) return;
    void runCmsMutation(editor.video ? 'Save video' : 'Create video', async () => {
      if (editor.video) await updateDiscoverVideo(editor.video.id, input);
      else await createDiscoverVideo(input);
      setEditor({ open: false });
    });
  };
  const remove = (video: DiscoverVideo) => Alert.alert('Delete video', `Delete “${video.title}”?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: () => {
      void runCmsMutation('Delete video', () => deleteDiscoverVideo(video.id));
    } },
  ]);

  return (
    <Screen>
      <TopBar title={t('admin.content.videos')} />

      <View style={styles.actionBar}>
        <SearchBar value={query} onChangeText={setQuery} placeholder={t('admin.search')} />
        <Pressable onPress={() => setEditor({ open: true })} style={({ pressed }) => [styles.createBtn, pressed && styles.pressed]}>
          <Ionicons name="add" size={20} color={colors.white} />
          <Text style={styles.createBtnText}>{t('admin.create')}</Text>
        </Pressable>
      </View>

      <Text style={styles.summary}>
        {videos.length} videos · {totalViews.toLocaleString()} views
      </Text>

      <View style={styles.list}>
        {videos.map((video) => {
          const date = new Date(video.publishedAt).toLocaleDateString('en-RW', {
            day: 'numeric', month: 'short', year: 'numeric',
          });
          return (
            <View key={video.id} style={styles.row}>
              <View style={styles.thumb}>
                <Ionicons name="play" size={20} color={colors.white} />
                {video.duration ? (
                  <Text style={styles.duration}>{video.duration}</Text>
                ) : null}
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle} numberOfLines={2}>{video.title}</Text>
                <Text style={styles.rowMeta} numberOfLines={1}>{video.departmentName} · {date}</Text>
                <View style={styles.statsRow}>
                  <Ionicons name="eye-outline" size={12} color={colors.textFaint} />
                  <Text style={styles.statText}>{video.views.toLocaleString()}</Text>
                  {video.isVerified && (
                    <Ionicons name="checkmark-circle" size={12} color={colors.gold} />
                  )}
                </View>
              </View>
              <View style={styles.actions}>
                <Pressable onPress={() => setEditor({ open: true, video })} style={styles.actionBtn}>
                  <Ionicons name="create-outline" size={16} color={colors.brand} />
                </Pressable>
                <Pressable onPress={() => remove(video)} style={styles.actionBtn}>
                  <Ionicons name="trash-outline" size={16} color={colors.emergency} />
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>

      <AdminCrudModal
        visible={editor.open}
        title={editor.video ? 'Edit video' : 'Create video'}
        submitLabel={editor.video ? 'Save changes' : 'Create video'}
        initialValues={fields(editor.video)}
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
      width: 64, height: 44, borderRadius: radius.sm, backgroundColor: colors.brand,
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    duration: {
      position: 'absolute', bottom: 2, right: 4,
      fontFamily: 'Manrope_700Bold', fontSize: 9, color: colors.white,
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