import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { radius, sans, shadow, spacing, useTheme, type Colors } from '@/theme';

export type CrudField = {
  key: string;
  label: string;
  placeholder?: string;
  value: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  autoCapitalize?: 'none' | 'sentences' | 'words';
  hint?: string;
};

interface AdminCrudModalProps {
  visible: boolean;
  title: string;
  submitLabel: string;
  initialValues: CrudField[];
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => void;
  destructive?: boolean;
}

export function AdminCrudModal({
  visible,
  title,
  submitLabel,
  initialValues,
  onClose,
  onSubmit,
  destructive = false,
}: AdminCrudModalProps) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialValues.map((field) => [field.key, field.value])),
  );

  const fields = useMemo(() => initialValues, [initialValues]);

  const update = (key: string, value: string) => setValues((current) => ({ ...current, [key]: value }));

  const canSubmit = fields.every((field) => field.key === 'notes' || values[field.key]?.trim().length > 0);
  const resetKey = initialValues.map((field) => `${field.key}:${field.value}`).join('|');

  return (
    <Modal key={resetKey} visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.titleWrap}>
              <View style={[styles.icon, destructive && styles.iconDanger]}>
                <Ionicons name={destructive ? 'trash-outline' : 'create-outline'} size={22} color={colors.white} />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.eyebrow}>Admin editor</Text>
                <Text style={styles.title}>{title}</Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close editor">
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {fields.map((field) => (
              <Field
                key={field.key}
                label={field.label}
                value={values[field.key] ?? ''}
                onChangeText={(text) => update(field.key, text)}
                placeholder={field.placeholder}
                keyboardType={field.keyboardType}
                autoCapitalize={field.autoCapitalize ?? 'sentences'}
                multiline={field.multiline}
                hint={field.hint}
              />
            ))}
          </ScrollView>

          <View style={styles.actions}>
            <Button label="Cancel" variant="secondary" onPress={onClose} />
            <Button
              label={submitLabel}
              variant={destructive ? 'emergency' : 'primary'}
              onPress={() => onSubmit(values)}
              disabled={!canSubmit}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(4, 14, 32, 0.7)',
    },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      maxHeight: '90%',
      ...shadow.raised,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    titleWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
    icon: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
    iconDanger: { backgroundColor: colors.emergency },
    headerText: { flex: 1 },
    eyebrow: { ...sans.eyebrow, color: colors.accent },
    title: { ...sans.title, color: colors.text },
    closeBtn: { width: 36, height: 36, borderRadius: radius.sm, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' },
    content: { padding: spacing.lg, gap: spacing.md },
    actions: { flexDirection: 'row', gap: spacing.sm, padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  });
