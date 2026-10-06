/**
 * Discover › Photos — official police photo library.
 */
import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { TopBar } from '@/components/TopBar';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { radius, sans, shadow, spacing, useTheme, type Colors } from '@/theme';
import { useState } from 'react';
import type { DiscoverPhoto } from '@/types';

export default function DiscoverPhotosScreen() {
  const t = useT();
  const { discoverPhotos } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [query, setQuery] = useState('');

  const photos = query.trim()
    ? discoverPhotos.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.departmentName.toLowerCase().includes(q) ||
          (p.caption ?? '').toLowerCase().includes(q) ||
          p.tags.some((tag) => tag.toLowerCase().includes(q))
        );
      })
    : discoverPhotos;

  return (
    <Screen>
      <TopBar title={t('discover.photos')} />
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder={t('discover.search')}
        mb={spacing.md}
      />

      {photos.length === 0 ? (
        <Text style={styles.empty}>{t('discover.noResults')}</Text>
      ) : (
        <View style={styles.grid}>
          {photos.map((photo) => (
            <PhotoCard key={photo.id} photo={photo} colors={colors} styles={styles} />
          ))}
        </View>
      )}
    </Screen>
  );
}

function PhotoCard({
  photo,
  colors,
  styles,
}: {
  photo: DiscoverPhoto;
  colors: Colors;
  styles: ReturnType<typeof makeStyles>;
}) {
  const date = new Date(photo.publishedAt).toLocaleDateString('en-RW', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <View style={styles.card}>
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: photo.imageUri }}
          style={styles.image}
          accessibilityLabel={photo.title}
          resizeMode="cover"
        />
        {photo.isVerified && (
          <View style={styles.verifiedOverlay}>
            <Ionicons name="checkmark-circle" size={16} color={colors.gold} />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.cardBody}>
        <Text style={styles.title} numberOfLines={2}>{photo.title}</Text>
        {photo.caption && (
          <Text style={styles.caption} numberOfLines={2}>{photo.caption}</Text>
        )}
        <View style={styles.footer}>
          <View style={styles.deptRow}>
            <Ionicons name="shield-checkmark" size={12} color={colors.brand} />
            <Text style={styles.deptName}>{photo.departmentName}</Text>
          </View>
          <View style={styles.metaRight}>
            <Ionicons name="eye-outline" size={12} color={colors.textFaint} />
            <Text style={styles.metaText}>{photo.views.toLocaleString()}</Text>
            <Text style={styles.metaText}>{date}</Text>
          </View>
        </View>

        {/* Tags */}
        {photo.tags.length > 0 && (
          <View style={styles.tagRow}>
            {photo.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}
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
    grid: { gap: spacing.md },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      ...shadow.card,
    },
    imageContainer: {
      height: 200,
      backgroundColor: colors.sage,
      position: 'relative',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    verifiedOverlay: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm,
      backgroundColor: 'rgba(10,31,68,0.7)',
      borderRadius: radius.pill,
      padding: 4,
    },
    cardBody: {
      padding: spacing.md,
      gap: spacing.xs,
    },
    title: { ...sans.label, color: colors.text, fontSize: 14, lineHeight: 20 },
    caption: { ...sans.small, color: colors.textMuted, fontSize: 13, lineHeight: 19 },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.xs,
    },
    deptRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    deptName: { ...sans.tiny, color: colors.brand },
    metaRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metaText: { ...sans.tiny, color: colors.textFaint },
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
    tag: {
      backgroundColor: colors.brandSoft,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    tagText: { ...sans.tiny, color: colors.brand },
  });
