/**
 * Admin › Content Management › Posts
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
import type { DiscoverPost } from '@/types';

export default function AdminPostsScreen() {
  const t = useT();
  const { discoverPosts, searchDiscoverPosts, createDiscoverPost, updateDiscoverPost, deleteDiscoverPost } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [query, setQuery] = useState('');
  const [editor, setEditor] = useState<{ open: boolean; post?: DiscoverPost }>({ open: false });

  const posts = query.trim() ? searchDiscoverPosts(query) : discoverPosts;
  const fields = (post?: DiscoverPost): CrudField[] => [
    { key: 'title', label: 'Title', value: post?.title ?? '', placeholder: 'Post title' },
    { key: 'departmentName', label: 'Department', value: post?.departmentName ?? '', placeholder: 'Department name' },
    { key: 'body', label: 'Body', value: post?.body ?? '', placeholder: 'Post content', multiline: true },
    { key: 'tags', label: 'Tags', value: post?.tags.join(', ') ?? '', placeholder: 'safety, community' },
  ];

  const submit = (values: Record<string, string>) => {
    const input = {
      departmentId: editor.post?.departmentId,
      departmentName: values.departmentName.trim() || 'Rwanda National Police',
      title: values.title.trim(),
      body: values.body.trim(),
      tags: values.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      publishedAt: editor.post?.publishedAt ?? new Date().toISOString(),
      views: editor.post?.views ?? 0,
      likes: editor.post?.likes ?? 0,
      isVerified: editor.post?.isVerified ?? true,
    };
    if (!input.title || !input.body) return;
    void runCmsMutation(editor.post ? 'Save post' : 'Create post', async () => {
      if (editor.post) await updateDiscoverPost(editor.post.id, input);
      else await createDiscoverPost(input);
      setEditor({ open: false });
    });
  };
  const remove = (post: DiscoverPost) => Alert.alert('Delete post', `Delete “${post.title}”?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: () => {
      void runCmsMutation('Delete post', () => deleteDiscoverPost(post.id));
    } },
  ]);

  return (
    <Screen>
      <TopBar title={t('admin.content.posts')} />

      <View style={styles.actionBar}>
        <SearchBar value={query} onChangeText={setQuery} placeholder={t('admin.search')} />
        <Pressable onPress={() => setEditor({ open: true })} style={({ pressed }) => [styles.createBtn, pressed && styles.pressed]}>
          <Ionicons name="add" size={20} color={colors.white} />
          <Text style={styles.createBtnText}>{t('admin.create')}</Text>
        </Pressable>
      </View>

      <Text style={styles.summary}>{posts.length} posts</Text>

      <View style={styles.list}>
        {posts.map((post) => {
          const date = new Date(post.publishedAt).toLocaleDateString('en-RW', {
            day: 'numeric', month: 'short', year: 'numeric',
          });
          return (
            <View key={post.id} style={styles.row}>
              <View style={styles.deptIcon}>
                <Ionicons name="shield-checkmark" size={18} color={colors.white} />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle} numberOfLines={2}>{post.title}</Text>
                <Text style={styles.rowMeta}>{post.departmentName} · {date}</Text>
                <View style={styles.statsRow}>
                  <Ionicons name="eye-outline" size={12} color={colors.textFaint} />
                  <Text style={styles.statText}>{post.views.toLocaleString()}</Text>
                  <Ionicons name="heart-outline" size={12} color={colors.textFaint} />
                  <Text style={styles.statText}>{post.likes.toLocaleString()}</Text>
                  {post.isVerified && (
                    <Ionicons name="checkmark-circle" size={12} color={colors.gold} />
                  )}
                </View>
              </View>
              <View style={styles.actions}>
                <Pressable onPress={() => setEditor({ open: true, post })} style={styles.actionBtn}>
                  <Ionicons name="create-outline" size={16} color={colors.brand} />
                </Pressable>
                <Pressable onPress={() => remove(post)} style={styles.actionBtn}>
                  <Ionicons name="trash-outline" size={16} color={colors.emergency} />
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>

      <AdminCrudModal
        visible={editor.open}
        title={editor.post ? 'Edit post' : 'Create post'}
        submitLabel={editor.post ? 'Save changes' : 'Create post'}
        initialValues={fields(editor.post)}
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
