import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, View, useWindowDimensions } from 'react-native';
import { DESKTOP_BREAKPOINT } from '@/components/DesktopNav';
import { useT } from '@/i18n';
import { fonts, radius, useTheme } from '@/theme';

/**
 * Main 5-tab bottom navigation.
 * Home | Map | Report (accented centre) | Discover | Profile
 *
 * The Report tab is visually emphasised — raised amber circle — because
 * citizen reporting is the core FixRwanda function.
 */
export default function TabsLayout() {
  const t = useT();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  // Wide screens use the persistent desktop navigation bar instead.
  const isWide = width >= DESKTOP_BREAKPOINT;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: isWide
          ? { display: 'none' }
          : {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              borderTopWidth: 1,
              paddingTop: 6,
              paddingBottom: Platform.OS === 'ios' ? 20 : 10,
              height: Platform.OS === 'ios' ? 70 : 60,
              shadowColor: '#0F172A',
              shadowOpacity: 0.06,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: -2 },
              elevation: 4,
            },
        tabBarLabelStyle: {
          fontFamily: fonts.sansSemiBold,
          fontSize: 11,
          letterSpacing: 0.2,
          marginTop: 2,
        },
        tabBarItemStyle: { minHeight: 44 },
      }}
    >
      {/* 1 — Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: t('tab.home'),
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />

      {/* 2 — Map */}
      <Tabs.Screen
        name="map"
        options={{
          title: t('tab.map'),
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? 'map' : 'map-outline'} size={size} color={color} />
          ),
        }}
      />

      {/* 3 — Report (accented centre button) */}
      <Tabs.Screen
        name="report"
        options={{
          title: t('tab.report'),
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: radius.pill,
                backgroundColor: focused ? colors.gold : colors.brand,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: Platform.OS === 'ios' ? 8 : 4,
                shadowColor: colors.brand,
                shadowOpacity: 0.35,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
                elevation: 6,
              }}
            >
              <Ionicons name="add" size={28} color="#FFFFFF" />
            </View>
          ),
          tabBarLabelStyle: {
            fontFamily: fonts.sansSemiBold,
            fontSize: 11,
            letterSpacing: 0.2,
            marginTop: Platform.OS === 'ios' ? -2 : 2,
            color: colors.brand,
          },
        }}
      />

      {/* 4 — Discover */}
      <Tabs.Screen
        name="discover"
        options={{
          title: t('tab.discover'),
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? 'compass' : 'compass-outline'} size={size} color={color} />
          ),
        }}
      />

      {/* 5 — Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tab.profile'),
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={size} color={color} />
          ),
        }}
      />

      {/* Hidden screens — kept in route group but not shown in tab bar */}
      <Tabs.Screen name="reports" options={{ href: null }} />
      <Tabs.Screen name="rewards" options={{ href: null }} />
      <Tabs.Screen name="police" options={{ href: null }} />
    </Tabs>
  );
}
