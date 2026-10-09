import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, useTheme, type Colors } from '@/theme';

interface ScreenProps {
  children: ReactNode;
  /** A fixed action bar under the content. Keeps one primary action visible. */
  footer?: ReactNode;
  /** A fixed bar pinned above the scrollable content (e.g. MobileHeader). */
  header?: ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}

export function Screen({ children, footer, header, scroll = true, contentStyle }: ScreenProps) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {header ? <View>{header}</View> : null}
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.content, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, styles.content, contentStyle]}>{children}</View>
      )}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    content: {
      paddingHorizontal: spacing.gutter,
      paddingTop: spacing.md,
      paddingBottom: spacing.xl,
      gap: spacing.lg,
      maxWidth: 640,
      width: '100%',
      alignSelf: 'center',
    },
    footer: {
      paddingHorizontal: spacing.gutter,
      paddingTop: spacing.md,
      paddingBottom: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
      maxWidth: 640,
      width: '100%',
      alignSelf: 'center',
      gap: spacing.sm,
    },
  });
