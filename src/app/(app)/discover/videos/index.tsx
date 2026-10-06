/**
 * Discover › Videos — official police video content.
 */
import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { TopBar } from '@/components/TopBar';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { radius, sans, shadow, spacing, useTheme, type Colors } from '@/theme';
import { useState } from 'react';
import type { DiscoverVideo } from '@/types';

export default function DiscoverVideosScreen() {
  const t = useT();
  const { discoverVideos, searchDiscoverVideos } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [query, setQuery] = useState('');

  const videos = query.trim() ? searchDiscoverVideos(query) : discoverVideos;

  return (
    <Screen>
      <TopBar title={t('discover.videos')} />
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder={t('discover.search')}
        mb={spacing.md}
      />

      {videos.length === 0 ? (
        <Text style={styles.empty}>{t('discover.noResults')}</Text>
      ) : (
        <View style={styles.list}>
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} colors={colors} styles={styles} t={t} />
          ))}
        </View>
      )}
    </Screen>
  );
}

function VideoCard({
  video,
  colors,
  styles,
  t,
}: {
  video: DiscoverVideo;
  colors: Colors;
  styles: ReturnType<typeof makeStyles>;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const date = new Date(video.publishedAt).toLocaleDateString('en-RW', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  function handleWatch() {
    if (video.youtubeUrl) {
      Linking.openURL(video.youtubeUrl).catch(() => {});
    }
  }

  return (
    <View style={styles.card}>
      {/* Thumbnail placeholder */}
      <Pressable
        onPress={handleWatch}
        accessibilityRole="button"
        accessibilityLabel={t('discover.watchVideo')}
        style={({ pressed }) => [styles.thumb, pressed && styles.pressed]}
      >
        <View style={styles.thumbInner}>
          <Ionicons name="logo-youtube" size={44} color="#FF0000" />
          {video.duration && (
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{video.duration}</Text>
            </View>
          )}
        </View>
      </Pressable>

      {/* Info */}
      <View style={styles.cardBody}>
        {/* Dept + date */}
        <View style={styles.metaRow}>
          <View style={styles.deptIcon}>
            <Ionicons name="shield-checkmark" size={14} color={colors.white} />
          </View>
          <Text style={styles.deptName}>{video.departmentName}</Text>
          <Text style={styles.dateText}>{date}</Text>
          {video.isVerified && (
            <View style={styles.badge}>
              <Ionicons name="checkmark-circle" size={11} color={colors.gold} />
            </View>
          )}
        </View>

        <Text style={styles.title}>{video.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{video.description}</Text>

        <View style={styles.footer}>
          <View style={styles.stat}>
            <Ionicons name="eye-outline" size={13} color={colors.textFaint} />
            <Text style={styles.statText}>{video.views.toLocaleString()}</Text>
          </View>
          {video.youtubeUrl && (
            <Pressable
              onPress={handleWatch}
              style={({ pressed }) => [styles.watchBtn, pressed && styles.pressed]}
            >
              <Ionicons name="play" size={14} color={colors.white} />
              <Text style={styles.watchBtnText}>{t('discover.watchVideo')}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    empty: {
      ...sans.body,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: spacing.xl,
    },
    list: { gap: spacing.md },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      ...shadow.card,
    },
    thumb: {
      height: 180,
      backgroundColor: colors.brand,
    },
    thumbInner: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.brandDeep,
    },
    durationBadge: {
      position: 'absolute',
      bottom: spacing.sm,
      right: spacing.sm,
      backgroundColor: 'rgba(0,0,0,0.75)',
      borderRadius: radius.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    durationText: { ...sans.tiny, color: '#FFF' },
    cardBody: { padding: spacing.md, gap: spacing.sm },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    deptIcon: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deptName: { ...sans.tiny, color: colors.textMuted, flex: 1 },
    dateText: { ...sans.tiny, color: colors.textFaint },
    badge: {
      width: 18,
      height: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: { ...sans.label, color: colors.text, fontSize: 15, lineHeight: 22 },
    description: { ...sans.body, color: colors.textMuted, fontSize: 14, lineHeight: 21 },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: spacing.sm,
    },
    stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    statText: { ...sans.tiny, color: colors.textFaint },
    watchBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: colors.brand,
      borderRadius: radius.pill,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
    },
    watchBtnText: { ...sans.tiny, color: colors.white },
    pressed: { opacity: 0.8 },
  });
