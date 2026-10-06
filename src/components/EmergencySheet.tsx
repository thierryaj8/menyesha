import { Ionicons } from '@expo/vector-icons';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { HOTLINES } from '@/data/kigali';
import { useT } from '@/i18n';
import { HIT_SIZE, radius, sans, serif, spacing, useTheme, type Colors } from '@/theme';
import { Button } from './Button';

interface EmergencyValue {
  open: () => void;
}

const EmergencyContext = createContext<EmergencyValue>({ open: () => {} });

export function useEmergency(): EmergencyValue {
  return useContext(EmergencyContext);
}

/**
 * Hotlines are reachable from anywhere — including before logging in.
 * Always a bottom sheet, always with the "this app is not for emergencies"
 * line spelled out.
 */
export function EmergencyProvider({ children }: { children: ReactNode }) {
  const t = useT();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [visible, setVisible] = useState(false);

  const value = useMemo<EmergencyValue>(() => ({ open: () => setVisible(true) }), []);

  const call = (number: string) => {
    Linking.openURL(`tel:${number}`).catch(() => {});
  };

  return (
    <EmergencyContext.Provider value={value}>
      {children}

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.fill}>
          <Pressable
            style={styles.backdrop}
            onPress={() => setVisible(false)}
            accessibilityLabel={t('common.close')}
          />
          <View style={styles.sheet}>
            <View style={styles.grabber} />

            <View style={styles.header}>
              <Text style={styles.title}>{t('emergency.sheetTitle')}</Text>
              <Text style={styles.subtitle}>{t('emergency.sheetSubtitle')}</Text>
            </View>

            <View style={styles.list}>
              {HOTLINES.map((line) => (
                <Pressable
                  key={line.number}
                  onPress={() => call(line.number)}
                  accessibilityRole="button"
                  accessibilityLabel={`${t('emergency.callNow')} ${line.number}, ${t(line.labelKey)}`}
                  style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                >
                  <Text style={styles.number}>{line.number}</Text>
                  <Text style={styles.rowLabel}>{t(line.labelKey)}</Text>
                  <View style={styles.callBadge}>
                    <Ionicons name="call" size={18} color={colors.white} />
                  </View>
                </Pressable>
              ))}
            </View>

            <View style={styles.warn}>
              <Ionicons name="alert-circle" size={18} color={colors.emergencyForeground} />
              <Text style={styles.warnText}>{t('emergency.notForEmergencies')}</Text>
            </View>

            <Button label={t('common.close')} variant="quiet" onPress={() => setVisible(false)} />
          </View>
        </View>
      </Modal>
    </EmergencyContext.Provider>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    fill: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
    backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      padding: spacing.lg,
      paddingBottom: spacing.xl,
      gap: spacing.md,
      maxWidth: 640,
      width: '100%',
      alignSelf: 'center',
    },
    grabber: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.borderStrong,
    },
    header: { gap: spacing.xs },
    title: { ...serif.h2, color: colors.text },
    subtitle: { ...sans.body, color: colors.textMuted },
    list: { gap: spacing.sm },
    row: {
      minHeight: HIT_SIZE + 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    rowPressed: { backgroundColor: colors.sage },
    number: { ...serif.h2, color: colors.brandForeground, minWidth: 64 },
    rowLabel: { ...sans.body, color: colors.text, flex: 1 },
    callBadge: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.emergency,
      alignItems: 'center',
      justifyContent: 'center',
    },
    warn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.emergencySoft,
      borderRadius: radius.md,
      padding: spacing.md,
    },
    warnText: { ...sans.small, color: colors.emergencyForeground, flex: 1 },
  });
