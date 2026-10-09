import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '@/store/AppProvider';
import { useTheme } from '@/theme';

/**
 * Compact mobile app header: MENYESHA wordmark left, notifications (with
 * badge) and profile shortcuts right. Quiet 56px bar with a hairline border.
 */
export function MobileHeader() {
  const { colors } = useTheme();
  const { unreadCount } = useApp();
  const styles = makeStyles(colors);

  return (
    <View style={styles.bar}>
      <View style={styles.brand}>
        <Image
          source={require('../../assets/android-icon-foreground.png')}
          style={styles.mark}
          resizeMode="contain"
        />
        <Text style={styles.wordmark}>MENYESHA</Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() => router.push('/notifications')}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          hitSlop={8}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          ) : null}
        </Pressable>

        <Pressable
          onPress={() => router.push('/profile')}
          accessibilityRole="button"
          accessibilityLabel="Profile"
          hitSlop={8}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
        >
          <Ionicons name="person-circle-outline" size={26} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 56,
      paddingHorizontal: 18,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    mark: { width: 26, height: 26 },
    wordmark: {
      fontFamily: 'Manrope_800ExtraBold',
      fontSize: 16,
      letterSpacing: 2.5,
      color: colors.text,
    },
    actions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    iconBtn: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badge: {
      position: 'absolute',
      top: 6,
      right: 4,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: '#F45B63',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
    pressed: { opacity: 0.6 },
  });
