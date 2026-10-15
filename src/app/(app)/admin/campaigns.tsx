import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { TopBar } from '@/components/TopBar';
import { AdminCrudModal, type CrudField } from '@/components/AdminCrudModal';
import { useApp } from '@/store/AppProvider';
import { runCmsMutation } from '@/utils/cms';
import { radius, sans, spacing, useTheme, type Colors } from '@/theme';
import type { Campaign } from '@/types';

export default function AdminCampaignsScreen() {
  const { campaigns, createCampaign, updateCampaign, deleteCampaign } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [query, setQuery] = useState('');
  const [editor, setEditor] = useState<{ open: boolean; campaign?: Campaign }>({ open: false });

  const filtered = campaigns.filter((campaign) =>
    `${campaign.title} ${campaign.topic} ${campaign.description}`.toLowerCase().includes(query.toLowerCase()),
  );
  const fields = (campaign?: Campaign): CrudField[] => [
    { key: 'title', label: 'Title', value: campaign?.title ?? '', placeholder: 'Campaign title' },
    { key: 'description', label: 'Description', value: campaign?.description ?? '', placeholder: 'Campaign message', multiline: true },
    { key: 'topic', label: 'Topic', value: campaign?.topic ?? '', placeholder: 'Road safety' },
    { key: 'slot', label: 'Placement', value: campaign?.slot ?? 'general', placeholder: 'home_banner' },
    { key: 'startsAt', label: 'Starts at (ISO date)', value: campaign?.startsAt ?? '', placeholder: '2026-10-14T00:00:00.000Z' },
    { key: 'endsAt', label: 'Ends at (ISO date)', value: campaign?.endsAt ?? '', placeholder: '2026-11-14T00:00:00.000Z' },
    { key: 'imageUri', label: 'Image URL', value: campaign?.imageUri ?? '', placeholder: 'https://example.com/campaign.jpg', optional: true },
    { key: 'videoUri', label: 'Video URL', value: campaign?.videoUri ?? '', placeholder: 'https://example.com/campaign.mp4', optional: true },
    { key: 'ctaLabel', label: 'Button label (optional)', value: campaign?.cta?.label ?? '', placeholder: 'Learn more', optional: true },
    { key: 'ctaUrl', label: 'Button URL (optional)', value: campaign?.cta?.url ?? '', placeholder: 'https://example.com', optional: true },
    { key: 'isActive', label: 'Active', value: campaign?.isActive ? 'true' : 'false', placeholder: 'true' },
  ];

  const submit = (values: Record<string, string>) => {
    const ctaLabel = values.ctaLabel.trim();
    const ctaUrl = values.ctaUrl.trim();
    const input = {
      title: values.title.trim(),
      description: values.description.trim(),
      topic: values.topic.trim(),
      slot: values.slot.trim() as Campaign['slot'],
      startsAt: values.startsAt.trim(),
      endsAt: values.endsAt.trim(),
      imageUri: values.imageUri.trim() || undefined,
      videoUri: values.videoUri.trim() || undefined,
      cta: ctaLabel && ctaUrl ? { label: ctaLabel, url: ctaUrl } : undefined,
      isActive: values.isActive.trim().toLowerCase() !== 'false',
    };
    if (!input.title || !input.description || !input.topic) return;
    void runCmsMutation(editor.campaign ? 'Save campaign' : 'Create campaign', async () => {
      if (editor.campaign) await updateCampaign(editor.campaign.id, input);
      else await createCampaign(input);
      setEditor({ open: false });
    });
  };
  const remove = (campaign: Campaign) => Alert.alert('Delete campaign', `Delete “${campaign.title}”?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: () => {
      void runCmsMutation('Delete campaign', () => deleteCampaign(campaign.id));
    } },
  ]);

  return (
    <Screen>
      <TopBar title="Campaigns" />
      <View style={styles.actionBar}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search campaigns" />
        <Pressable onPress={() => setEditor({ open: true })} style={styles.createButton}>
          <Ionicons name="add" size={20} color={colors.white} />
          <Text style={styles.createText}>Create</Text>
        </Pressable>
      </View>
      <Text style={styles.summary}>{filtered.length} campaigns</Text>
      <View style={styles.list}>
        {filtered.map((campaign) => (
          <View key={campaign.id} style={styles.row}>
            <View style={styles.body}>
              <Text style={styles.title}>{campaign.title}</Text>
              <Text style={styles.meta}>{campaign.topic} · {campaign.slot.replace('_', ' ')} · {campaign.isActive ? 'Active' : 'Inactive'}</Text>
              <Text style={styles.meta}>{campaign.views.toLocaleString()} views · {campaign.clicks.toLocaleString()} clicks</Text>
            </View>
            <Pressable onPress={() => setEditor({ open: true, campaign })} style={styles.action}>
              <Ionicons name="create-outline" size={18} color={colors.brand} />
            </Pressable>
            <Pressable onPress={() => remove(campaign)} style={styles.action}>
              <Ionicons name="trash-outline" size={18} color={colors.emergency} />
            </Pressable>
          </View>
        ))}
      </View>
      <AdminCrudModal
        visible={editor.open}
        title={editor.campaign ? 'Edit campaign' : 'Create campaign'}
        submitLabel={editor.campaign ? 'Save changes' : 'Create campaign'}
        initialValues={fields(editor.campaign)}
        onClose={() => setEditor({ open: false })}
        onSubmit={submit}
      />
    </Screen>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  actionBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  createButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, padding: spacing.sm, backgroundColor: colors.brand, borderRadius: radius.md },
  createText: { ...sans.label, color: colors.white },
  summary: { ...sans.tiny, color: colors.textMuted, marginVertical: spacing.sm },
  list: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  body: { flex: 1, gap: 4 },
  title: { ...sans.label, color: colors.text },
  meta: { ...sans.tiny, color: colors.textMuted },
  action: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, backgroundColor: colors.sage },
});
