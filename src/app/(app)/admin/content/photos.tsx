/**
 * Admin › Content Management › Photos
 */
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { TopBar } from '@/components/TopBar';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { radius, sans, shadow, spacing, useTheme, type Colors } from '@/theme';
import { useState } from 'react';

export default function AdminPhotosScreen() {
  const t = useT();
  const { discoverPhotos, searchDiscoverPhotos } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [query, setQuery] = useState('');

  const photos = query.trim() ? searchDiscoverPhotos(query) : discoverPhotos;
  const totalViews = photos.reduce((sum, p) => sum + p.views, 0);

  return (
    <Screen>
      <TopBar title={t('admin.content.photos')} />

      <View style={styles.actionBar}>
        <SearchBar value={query} onChangeText={setQuery} placeholder={t('admin.search')} />
        <Pressable onPress={() => {}} style={({ pressed }) => [styles.createBtn, pressed && styles.pressed]}>
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
                <Pressable onPress={() => {}} style={styles.actionBtn}>
                  <Ionicons name="create-outline" size={16} color={colors.brand} />
                </Pressable>
                <Pressable onPress={() => {}} style={styles.actionBtn}>
                  <Ionicons name="trash-outline" size={16} color={colors.emergency} />
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
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