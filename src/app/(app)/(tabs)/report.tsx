import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { CATEGORIES } from '@/data/meta';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { fonts, HIT_SIZE, radius, sans, serif, spacing, useTheme, type Colors } from '@/theme';
import { useState } from 'react';

export default function ReportScreen() {
  const t = useT();
  const { submitReport } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [incidentDate, setIncidentDate] = useState('');
  const [incidentTime, setIncidentTime] = useState('');
  const [locationDetected, setLocationDetected] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!description.trim() || !selectedCategory) return;
    await submitReport({
      categoryId: selectedCategory as any,
      description: description.trim(),
      isAnonymous,
      incidentDate,
      incidentTime,
    });
    router.push('/report/done');
  };

  return (
    <Screen>
      <TopBar onBack={() => router.back()} title={t('report.catTitle')} />

      <View style={styles.container}>
        {/* Category selection */}
        <Text style={styles.sectionTitle}>{t('report.catTitle')}</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((category) => {
            const palette = colors.category[category.id];
            const isSelected = selectedCategory === category.id;
            return (
              <Pressable
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                accessibilityRole="button"
                accessibilityLabel={t(category.labelKey)}
                style={({ pressed }) => [
                  styles.categoryCard,
                  isSelected && styles.categoryCardSelected,
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.categoryIcon, { backgroundColor: palette.bg }]}>
                  <Ionicons name={category.icon} size={22} color={palette.fg} />
                </View>
                <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelSelected]}>
                  {t(category.labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Evidence */}
        <Text style={styles.sectionTitle}>{t('report.evidenceLabel')}</Text>
        <View style={styles.evidenceRow}>
          <Pressable
            style={({ pressed }) => [styles.evidenceBtn, pressed && styles.pressed]}
            accessibilityRole="button"
          >
            <Ionicons name="camera" size={22} color={colors.accent} />
            <Text style={styles.evidenceText}>{t('report.takePhoto')}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.evidenceBtn, pressed && styles.pressed]}
            accessibilityRole="button"
          >
            <Ionicons name="videocam" size={22} color={colors.accent} />
            <Text style={styles.evidenceText}>{t('report.recordVideo')}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.evidenceBtn, pressed && styles.pressed]}
            accessibilityRole="button"
          >
            <Ionicons name="folder-open" size={22} color={colors.accent} />
            <Text style={styles.evidenceText}>{t('report.uploadFile')}</Text>
          </Pressable>
        </View>

        {/* Location */}
        <Text style={styles.sectionTitle}>{t('report.locationLabel')}</Text>
        <Pressable
          onPress={() => setLocationDetected(true)}
          style={({ pressed }) => [styles.locationBtn, pressed && styles.pressed]}
          accessibilityRole="button"
        >
          <Ionicons name="location" size={18} color={colors.accent} />
          <Text style={styles.locationText}>
            {locationDetected ? 'Location detected' : t('report.autoLocation')}
          </Text>
        </Pressable>

        {/* Description */}
        <Text style={styles.sectionTitle}>{t('report.descLabel')}</Text>
        <TextInput
          style={styles.textArea}
          placeholder={t('report.descPlaceholder')}
          placeholderTextColor={colors.textFaint}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
          textAlignVertical="top"
        />

        {/* Date/Time */}
        <Text style={styles.sectionTitle}>{t('report.whenLabel')}</Text>
        <View style={styles.dateTimeRow}>
          <View style={styles.dateTimeField}>
            <Text style={styles.dateTimeLabel}>{t('report.dateLabel')}</Text>
            <TextInput
              style={styles.dateTimeInput}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={colors.textFaint}
              value={incidentDate}
              onChangeText={setIncidentDate}
            />
          </View>
          <View style={styles.dateTimeField}>
            <Text style={styles.dateTimeLabel}>{t('report.timeLabel')}</Text>
            <TextInput
              style={styles.dateTimeInput}
              placeholder="HH:MM"
              placeholderTextColor={colors.textFaint}
              value={incidentTime}
              onChangeText={setIncidentTime}
            />
          </View>
        </View>

        {/* Anonymous toggle */}
        <Pressable
          onPress={() => setIsAnonymous(!isAnonymous)}
          style={styles.anonymousRow}
          accessibilityRole="switch"
          accessibilityState={{ checked: isAnonymous }}
        >
          <View style={[styles.checkbox, isAnonymous && styles.checkboxChecked]}>
            {isAnonymous && <Ionicons name="checkmark" size={14} color={colors.white} />}
          </View>
          <Text style={styles.anonymousText}>{t('report.anonymous')}</Text>
        </Pressable>

        {/* Submit */}
        <Button
          label={t('report.submitCta')}
          onPress={handleSubmit}
          disabled={!description.trim() || !selectedCategory}
          style={styles.submitBtn}
        />
      </View>
    </Screen>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  container: { gap: spacing.md },
  sectionTitle: { ...serif.h3, color: colors.text, marginTop: spacing.sm },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryCardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: { ...sans.label, color: colors.text, textAlign: 'center', fontSize: 12 },
  categoryLabelSelected: { color: colors.accent, fontWeight: '700' },

  evidenceRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  evidenceBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: HIT_SIZE,
  },
  evidenceText: { ...sans.small, color: colors.text, textAlign: 'center', fontSize: 11 },

  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: HIT_SIZE,
  },
  locationText: { ...sans.body, color: colors.text },

  textArea: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 100,
    fontFamily: fonts.sans,
    fontSize: 16,
    color: colors.text,
  },

  dateTimeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dateTimeField: {
    flex: 1,
    gap: spacing.xs,
  },
  dateTimeLabel: { ...sans.label, color: colors.textMuted, fontSize: 12 },
  dateTimeInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.text,
  },

  anonymousRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  anonymousText: { ...sans.body, color: colors.text },

  submitBtn: {
    marginTop: spacing.md,
  },

  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
});
