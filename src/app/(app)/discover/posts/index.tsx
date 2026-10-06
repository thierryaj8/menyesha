/**
 * Discover › Posts — official police posts from verified departments.
 */
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { TopBar } from '@/components/TopBar';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { radius, sans, shadow, spacing, useTheme, type Colors } from '@/theme';
import { useState } from 'react';
import type { DiscoverPost } from '@/types';

export default function DiscoverPostsScreen() {
  const t = useT();
  const { discoverPosts, searchDiscoverPosts } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [query, setQuery] = useState('');

  const posts = query.trim() ? searchDiscoverPosts(query) : discoverPosts;

  return (
    <Screen>
      <TopBar title={t('discover.posts')} />
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder={t('discover.search')}
        mb={spacing.md}
      />

      {posts.length === 0 ? (
        <Text style={styles.empty}>{t('discover.noResults')}</Text>
      ) : (
        <View style={styles.list}>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} colors={colors} styles={styles} t={t} />
          ))}
        </View>
      )}
    </Screen>
  );
}

function PostCard({
  post,
  colors,
  styles,
  t,
}: {
  post: DiscoverPost;
  colors: Colors;
  styles: ReturnType<typeof makeStyles>;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const date = new Date(post.publishedAt).toLocaleDateString('en-RW', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.deptIcon}>
          <Ionicons name="shield-checkmark" size={18} color={colors.white} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.deptName}>{post.departmentName}</Text>
          <Text style={styles.dateText}>{date}</Text>
        </View>
        {post.isVerified && (
          <View style={styles.badge}>
            <Ionicons name="checkmark-circle" size={12} color={colors.gold} />
            <Text style={styles.badgeText}>{t('discover.verifiedBadge')}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.body} numberOfLines={3}>{post.body}</Text>

      {/* Tags */}
      {post.tags.length > 0 && (
        <View style={styles.tagRow}>
          {post.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Footer stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Ionicons name="eye-outline" size={14} color={colors.textFaint} />
          <Text style={styles.statText}>{post.views.toLocaleString()}</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="heart-outline" size={14} color={colors.textFaint} />
          <Text style={styles.statText}>{post.likes.toLocaleString()}</Text>
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
      padding: spacing.md,
      gap: spacing.sm,
      ...shadow.card,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    deptIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerText: { flex: 1 },
    deptName: { ...sans.label, color: colors.text, fontSize: 13 },
    dateText: { ...sans.tiny, color: colors.textFaint },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: colors.goldSoft,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    badgeText: { ...sans.tiny, color: colors.gold },
    title: { ...sans.label, color: colors.text, fontSize: 15, lineHeight: 22 },
    body: { ...sans.body, color: colors.textMuted, fontSize: 14, lineHeight: 21 },
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
    tag: {
      backgroundColor: colors.brandSoft,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    tagText: { ...sans.tiny, color: colors.brand },
    statsRow: {
      flexDirection: 'row',
      gap: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: spacing.sm,
    },
    stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    statText: { ...sans.tiny, color: colors.textFaint },
  });
