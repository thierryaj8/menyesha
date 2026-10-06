import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { Note } from '@/components/Note';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { KIGALI_AREAS } from '@/data/kigali';
import { useT } from '@/i18n';
import { getMyLocation } from '@/hooks/useKigaliLocation';
import { useApp } from '@/store/AppProvider';
import { HIT_SIZE, radius, sans, serif, spacing, useTheme, type Colors } from '@/theme';

/** Step 2 — the only screen with typing, and it is all optional but one line. */
export default function ReportDetailsStep() {
  const t = useT();
  const { draft, updateDraft } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [locating, setLocating] = useState(false);
  const [pickingPlace, setPickingPlace] = useState(false);
  const [photoError, setPhotoError] = useState(false);

  const useMyLocation = async () => {
    setLocating(true);
    const result = await getMyLocation();
    updateDraft({ location: result.location, area: result.area });
    setLocating(false);
  };

  const addPhoto = async () => {
    setPhotoError(false);
    try {
      if (Platform.OS !== 'web') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          setPhotoError(true);
          return;
        }
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        quality: 0.7,
      });
      if (!result.canceled && result.assets[0]) {
        updateDraft({ photoUri: result.assets[0].uri });
      }
    } catch {
      setPhotoError(true);
    }
  };

  const canContinue = draft.description.trim().length > 3;

  return (
    <Screen
      footer={
        <Button
          label={t('common.next')}
          onPress={() => router.push('/report/review')}
          disabled={!canContinue}
          icon={<Ionicons name="arrow-forward" size={18} color={colors.white} />}
        />
      }
    >
      <TopBar onBack={() => router.back()} step={{ current: 2, total: 3 }} />

      <View>
        <Text style={styles.title}>{t('report.detailsTitle')}</Text>
      </View>

      <Field
        label={t('report.descLabel')}
        value={draft.description}
        onChangeText={(text) => updateDraft({ description: text })}
        placeholder={t('report.descPlaceholder')}
        multiline
        autoCapitalize="sentences"
        maxLength={400}
      />

      {/* Photo / video */}
      <View style={styles.block}>
        <Text style={styles.label}>{t('report.evidenceLabel')}</Text>
        {draft.photoUri ? (
          <View style={styles.photoRow}>
            <Image source={{ uri: draft.photoUri }} style={styles.thumb} />
            <View style={styles.flex}>
              <Text style={styles.photoName} numberOfLines={1}>
                {draft.photoUri.split('/').pop() ?? 'media'}
              </Text>
              <Pressable
                onPress={() => updateDraft({ photoUri: null })}
                accessibilityRole="button"
                style={[styles.remove, styles.removeHit]}
              >
                <Text style={styles.removeText}>{t('report.photoRemove')}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            onPress={addPhoto}
            accessibilityRole="button"
            style={({ pressed }) => [styles.addPhoto, pressed && { opacity: 0.85 }]}
          >
            <Ionicons name="camera-outline" size={20} color={colors.brandForeground} />
            <Text style={styles.addPhotoText}>{t('report.photoAdd')}</Text>
          </Pressable>
        )}
        <Text style={styles.hint}>
          {t('report.evidenceLabel')}: {t('common.optional')}
        </Text>
        {photoError ? <Text style={styles.error}>{t('report.errPhoto')}</Text> : null}
      </View>

      {/* Location */}
      <View style={styles.block}>
        <Text style={styles.label}>{t('report.locationLabel')}</Text>

        <View style={styles.locationRow}>
          <Button
            label={locating ? t('report.locating') : t('report.useLocation')}
            variant="secondary"
            onPress={useMyLocation}
            loading={locating}
            icon={<Ionicons name="navigate" size={16} color={colors.brandForeground} />}
            style={styles.flex}
          />
          <Button
            label={t('report.changePlace')}
            variant="quiet"
            onPress={() => setPickingPlace((open) => !open)}
            style={styles.flex}
          />
        </View>

        {pickingPlace ? (
          <View style={styles.places}>
            {KIGALI_AREAS.map((area) => (
              <Pressable
                key={area.name}
                onPress={() => {
                  updateDraft({
                    location: { latitude: area.latitude, longitude: area.longitude },
                    area: area.name,
                  });
                  setPickingPlace(false);
                }}
                accessibilityRole="button"
                style={[
                  styles.place,
                  draft.area === area.name && styles.placeActive,
                ]}
              >
                <Text
                  style={[
                    styles.placeText,
                    draft.area === area.name && styles.placeTextActive,
                  ]}
                >
                  {area.name}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>

      <Note icon="lock-closed-outline" tone="brand">
        {t('report.locationNote')}
      </Note>
      <Note icon="people-outline" tone="sage">
        {t('report.privacyNote')}
      </Note>
      <Note icon="camera-outline" tone="accent">
        {t('report.safetyNote')}
      </Note>
    </Screen>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  flex: { flex: 1 },
  title: { ...serif.h1, color: colors.text },
  block: { gap: spacing.sm },
  label: { ...sans.label, color: colors.text, marginLeft: spacing.xs + 2 },
  hint: { ...sans.small, color: colors.textMuted, marginLeft: spacing.xs + 2 },
  error: { ...sans.small, color: colors.emergencyForeground, marginLeft: spacing.xs + 2 },

  addPhoto: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 48,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.brandForeground,
    borderRadius: radius.md,
    backgroundColor: colors.brandSoft,
    paddingHorizontal: spacing.md,
  },
  addPhotoText: { ...sans.buttonSmall, color: colors.brandForeground },

  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  thumb: { width: 48, height: 48, borderRadius: radius.sm, backgroundColor: colors.sage },
  photoName: { ...sans.small, color: colors.text },
  remove: { justifyContent: 'center' },
  removeHit: { minHeight: HIT_SIZE },
  removeText: { ...sans.buttonSmall, color: colors.emergencyForeground },

  locationRow: { flexDirection: 'row', gap: spacing.sm },
  places: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  place: {
    minHeight: HIT_SIZE,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  placeActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  placeText: { ...sans.buttonSmall, color: colors.text },
  placeTextActive: { color: colors.white },
});
