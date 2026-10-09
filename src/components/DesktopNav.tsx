import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { router, usePathname } from 'expo-router';
import { LanguageMenu } from '@/components/LanguageMenu';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { fonts, radius, sans, shadow, spacing, useTheme, type Colors } from '@/theme';

/** Phones and small tablets keep the bottom tab bar; this bar is for wide screens. */
export const DESKTOP_BREAKPOINT = 900;

interface NavItem {
  labelKey: string;
  href: string;
  icon: string;
  /** Prefix match so /news/abc still highlights News. */
  match: string;
}

const ITEMS: NavItem[] = [
  { labelKey: 'nav.home', href: '/', icon: 'home-outline', match: '/' },
  { labelKey: 'nav.report', href: '/report', icon: 'create-outline', match: '/report' },
  { labelKey: 'nav.map', href: '/map', icon: 'map-outline', match: '/map' },
  { labelKey: 'nav.discover', href: '/discover', icon: 'compass-outline', match: '/discover' },
  { labelKey: 'nav.news', href: '/news', icon: 'newspaper-outline', match: '/news' },
  { labelKey: 'nav.trafficRules', href: '/traffic-rules', icon: 'car-outline', match: '/traffic-rules' },
  { labelKey: 'nav.departments', href: '/departments', icon: 'business-outline', match: '/departments' },
  { labelKey: 'nav.notifications', href: '/notifications', icon: 'notifications-outline', match: '/notifications' },
  { labelKey: 'nav.profile', href: '/profile', icon: 'person-circle-outline', match: '/profile' },
];

const DISCOVER_MENU: { labelKey: string; href: string; icon: string; subKey: string }[] = [
  { labelKey: 'discover.departments', href: '/discover/departments', icon: 'shield-checkmark', subKey: 'discover.departmentsSubtitle' },
  { labelKey: 'discover.posts', href: '/discover/posts', icon: 'chatbubbles', subKey: 'discover.postsSubtitle' },
  { labelKey: 'discover.videos', href: '/discover/videos', icon: 'play-circle', subKey: 'discover.videosSubtitle' },
  { labelKey: 'discover.photos', href: '/discover/photos', icon: 'images', subKey: 'discover.photosSubtitle' },
  { labelKey: 'discover.announcements', href: '/police/announcements', icon: 'megaphone', subKey: 'discover.announcementsSubtitle' },
  { labelKey: 'discover.campaigns', href: '/police/campaigns', icon: 'flag', subKey: 'discover.campaignsSubtitle' },
];

/**
 * Persistent navigation bar for wide screens (desktop web, tablets in
 * landscape). Mobile keeps the bottom tab bar; this renders only when the
 * viewport is at least DESKTOP_BREAKPOINT wide.
 *
 * Discover opens a submenu with the six official-content sections.
 */
export function DesktopNav() {
  const { width } = useWindowDimensions();
  if (width < DESKTOP_BREAKPOINT) return null;

  return <DesktopNavBar />;
}

function DesktopNavBar() {
  const t = useT();
  const { colors } = useTheme();
  const { unreadCount } = useApp();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const styles = makeStyles(colors);

  // A full-screen catcher closes the Discover submenu on outside press.
  const discoverActive = pathname.startsWith('/discover');

  function go(href: string) {
    setMenuOpen(false);
    if (pathname === href) return;
    router.push(href as any);
  }

  return (
    <>
      {menuOpen && (
        <Pressable
          style={styles.backdrop}
          accessibilityLabel={t('nav.closeMenu')}
          accessibilityRole="button"
          onPress={() => setMenuOpen(false)}
        />
      )}

      <View style={styles.bar}>
        <Pressable
          onPress={() => go('/')}
          accessibilityRole="button"
          accessibilityLabel={t('common.appName')}
          style={styles.brand}
        >
          <View style={styles.brandMark}>
            <Ionicons name="shield-checkmark" size={17} color={colors.white} />
          </View>
          <View style={styles.brandTextWrap}>
            <Text style={styles.brandText}>{t('common.appName')}</Text>
            <Text style={styles.brandSub}>Civic Safety</Text>
          </View>
        </Pressable>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.links}
        >
          {ITEMS.map((item) => {
            if (item.href === '/discover') {
              const active = discoverActive;
              return (
                <Pressable
                  key={item.href}
                  onPress={() => setMenuOpen((open) => !open)}
                  accessibilityRole="menuitem"
                  accessibilityState={{ expanded: menuOpen, selected: active }}
                  style={({ pressed }) => [
                    styles.link,
                    active && styles.linkActive,
                    pressed && styles.linkPressed,
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={16}
                    color={active ? colors.brandForeground : colors.textMuted}
                  />
                  <Text style={[styles.linkText, active && styles.linkTextActive]}>
                    {t(item.labelKey)}
                  </Text>
                  <Ionicons
                    name={menuOpen ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={active ? colors.brandForeground : colors.textMuted}
                  />
                </Pressable>
              );
            }

            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.match);
            const showBadge = item.href === '/notifications' && unreadCount > 0;

            return (
              <Pressable
                key={item.href}
                onPress={() => go(item.href)}
                accessibilityRole="link"
                accessibilityState={{ selected: active }}
                style={({ pressed }) => [
                  styles.link,
                  active && styles.linkActive,
                  pressed && styles.linkPressed,
                ]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={16}
                  color={active ? colors.brandForeground : colors.textMuted}
                />
                <Text style={[styles.linkText, active && styles.linkTextActive]}>
                  {t(item.labelKey)}
                </Text>
                {showBadge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}

        </ScrollView>

        <LanguageMenu variant="inline" />
      </View>

      {/* Discover submenu */}
      {menuOpen && (
        <View style={styles.menu}>
          <Text style={styles.menuTitle}>{t('discover.title')}</Text>
          <View style={styles.menuGrid}>
            {DISCOVER_MENU.map((entry) => (
              <Pressable
                key={entry.href}
                onPress={() => go(entry.href)}
                accessibilityRole="menuitem"
                style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
              >
                <View style={styles.menuIcon}>
                  <Ionicons name={entry.icon as any} size={18} color={colors.brand} />
                </View>
                <View style={styles.menuItemBody}>
                  <Text style={styles.menuItemLabel}>{t(entry.labelKey)}</Text>
                  <Text style={styles.menuItemSub} numberOfLines={1}>
                    {t(entry.subKey)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: 'rgba(22, 35, 56, 0.92)',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingHorizontal: spacing.gutter,
      paddingVertical: spacing.sm,
      zIndex: 20,
      ...shadow.card,
    },
    brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    brandMark: {
      width: 34,
      height: 34,
      borderRadius: radius.md,
      backgroundColor: colors.brand,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.12)',
    },
    brandTextWrap: { alignItems: 'flex-start' },
    brandText: {
      fontFamily: fonts.sansExtraBold,
      fontSize: 16,
      letterSpacing: 0.8,
      color: colors.text,
    },
    brandSub: {
      fontFamily: fonts.sans,
      fontSize: 10,
      letterSpacing: 1.2,
      color: colors.textMuted,
      textTransform: 'uppercase',
    },
    links: { flexDirection: 'row', alignItems: 'center', gap: 2, flex: 1 },
    link: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      height: 40,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    linkActive: {
      backgroundColor: colors.brandSoft,
      borderColor: 'rgba(79, 156, 249, 0.22)',
    },
    linkPressed: { backgroundColor: colors.sage },
    linkAdmin: { backgroundColor: colors.emergencySoft },
    linkText: { ...sans.tiny, color: colors.textMuted },
    linkTextActive: { color: colors.brandForeground },
    linkAdminText: { color: colors.emergencyForeground },
    badge: {
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      paddingHorizontal: 5,
      backgroundColor: colors.emergency,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: { fontFamily: fonts.sansBold, fontSize: 10, color: colors.white },
    backdrop: {
      ...StyleSheet.absoluteFill,
      zIndex: 15,
      backgroundColor: 'transparent',
    },
    menu: {
      position: 'absolute',
      top: 60,
      alignSelf: 'center',
      width: '92%',
      maxWidth: 880,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      gap: spacing.sm,
      zIndex: 25,
      ...shadow.raised,
    },
    menuTitle: { fontFamily: fonts.serif, fontSize: 18, color: colors.text },
    menuGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    menuItem: {
      width: '31.5%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.sm,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    menuItemPressed: { backgroundColor: colors.sage },
    menuIcon: {
      width: 36,
      height: 36,
      borderRadius: radius.sm,
      backgroundColor: colors.brandSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuItemBody: { flex: 1, gap: 1 },
    menuItemLabel: { ...sans.label, color: colors.text, fontSize: 13 },
    menuItemSub: { ...sans.tiny, color: colors.textMuted, fontSize: 11 },
  });