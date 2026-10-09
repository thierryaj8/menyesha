import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MobileHeader } from '@/components/MobileHeader';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { sans, spacing, useTheme, type Colors } from '@/theme';

export default function NotificationsScreen() {
  const t = useT();
  const { notifications, markNotificationRead, markAllNotificationsRead, unreadCount } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <Screen header={<MobileHeader />}>
      <TopBar title={t('nav.notifications')} />
      <View style={styles.headingRow}>
        <Text style={styles.subtitle}>{unreadCount} unread</Text>
        {unreadCount > 0 ? (
          <Pressable
            onPress={markAllNotificationsRead}
            accessibilityRole="button"
            accessibilityLabel="Mark all notifications as read"
            hitSlop={8}
            style={styles.action}
          >
            <Ionicons name="checkmark-done-outline" size={22} color={colors.brandForeground} />
          </Pressable>
        ) : null}
      </View>

      {notifications.map((notification) => (
        <Pressable
          key={notification.id}
          onPress={() => markNotificationRead(notification.id)}
          accessibilityRole="button"
          accessibilityState={{ selected: notification.isRead }}
          style={({ pressed }) => [
            styles.notification,
            !notification.isRead && styles.unread,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.icon}>
            <Ionicons
              name={notification.isUrgent ? 'warning-outline' : 'notifications-outline'}
              size={20}
              color={notification.isUrgent ? colors.emergencyForeground : colors.brandForeground}
            />
          </View>
          <View style={styles.body}>
            <Text style={styles.title}>{notification.title}</Text>
            <Text style={styles.copy}>{notification.body}</Text>
            <Text style={styles.date}>{new Date(notification.createdAt).toLocaleDateString()}</Text>
          </View>
          {!notification.isRead ? <View style={styles.dot} /> : null}
        </Pressable>
      ))}
    </Screen>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subtitle: { ...sans.small, color: colors.textMuted },
  action: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  notification: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  unread: { backgroundColor: colors.surface },
  pressed: { opacity: 0.7 },
  icon: { width: 36, alignItems: 'center', paddingTop: 2 },
  body: { flex: 1, gap: spacing.xs },
  title: { ...sans.label, color: colors.text },
  copy: { ...sans.body, color: colors.textMuted },
  date: { ...sans.small, color: colors.textFaint },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brand, marginTop: 6 },
});