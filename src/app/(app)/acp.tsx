import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { getCategory } from '@/data/meta';
import { chatWithAssistant } from '@/services/acpApi';
import { useApp } from '@/store/AppProvider';
import { radius, sans, spacing, useTheme, type Colors } from '@/theme';

interface ChatMsg {
  role: 'acp' | 'user';
  text: string;
}

const CATEGORY_HINTS: Record<string, string[]> = {
  crime: ['theft', 'stolen', 'robbery', 'burgl', 'assault', 'attack', 'fight', 'gun', 'break in'],
  suspicious: ['suspicious', 'suspect', 'stranger', 'disguise', 'peeping', 'prowler'],
  traffic: ['accident', 'crash', 'car', 'vehicle', 'truck', 'motorcycle', 'pedestrian', 'hit and run'],
  public_property: ['vandalism', 'property', 'pothole', 'street light', 'graffiti', 'damage'],
  other: ['fire', 'flood', 'power outage', 'medical', 'missing'],
};

const QUICK_COMMANDS = ['/help', 'report theft near me', '/police', '/hotlines', '/status'];

function guessCategory(text: string): string | undefined {
  const t = text.toLowerCase();
  for (const [id, words] of Object.entries(CATEGORY_HINTS)) {
    if (words.some((w) => t.includes(w))) return id;
  }
  return undefined;
}

/** Local "ACP" civic assistant — text commands + built-in RNP info, no backend. */
export default function AcpScreen() {
  const { myReports, submitReport } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const scrollRef = useRef<ScrollView | null>(null);

  const [msgs, setMsgs] = useState<ChatMsg[]>([
    {
      role: 'acp',
      text: "Muraho! I'm ACP — your MENYESHA assistant. Type /help to see what I can do, or describe an incident (e.g. \"a car accident on KG 11\") and I'll log it for you.",
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  const say = (text: string) => setMsgs((m) => [...m, { role: 'acp', text }]);

  const reply = async (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    const updated = [...msgs, { role: 'user' as const, text }];
    setMsgs(updated);
    const cmd = text.toLowerCase();

    // Local commands always stay local so they are deterministic/offline-safe.
    if (cmd === '/help' || cmd === 'help') {
      say(
        "Available commands:\n• /report <describe> — file a report from this chat\n• /status — how your reports are doing\n• /police — about Rwanda National Police\n• /hotlines — emergency numbers\n• /clear — wipe the chat\n\nWith an API key set, ACP also answers free-form questions via OpenAI.",
      );
      return;
    }
    if (cmd === '/clear') {
      setMsgs([]);
      return;
    }
    if (cmd === '/status') {
      say(
        myReports.length === 0
          ? "You haven't filed any reports yet. Type /report or describe the incident here."
          : `You have ${myReports.length} reports. Latest: ${getCategory(myReports[0].categoryId)?.id ?? ''} — ${myReports[0].status}.`,
      );
      return;
    }
    if (cmd === '/police' || cmd === '/rnp') {
      say(
        'Rwanda National Police (RNP) is Rwanda\'s official law-enforcement agency. You can find departments on the Departments page, and road-safety campaigns under the Police hub. For emergencies, call 112.',
      );
      return;
    }
    if (cmd === '/hotlines') {
      say('Emergency numbers in Rwanda:\n• 112 — Police (emergency)\n• 113 — Traffic Police / traffic hazards\n\nYou can also tap "Call police" on the home screen.');
      return;
    }
    if (cmd.startsWith('/report')) {
      const desc = text.replace(/^\/report\s*/i, '').trim();
      if (!desc) {
        say('Describe what happened, e.g:  /report my phone was stolen at Nyabugogo bus station');
        return;
      }
      await fileFromChat(desc);
      return;
    }

    // Free-form: route through our secure server endpoint.
    setTyping(true);
    const apiReply = await chatWithAssistant(
      updated.slice(-8).map((m) => ({
        role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.text,
      })),
    );
    setTyping(false);
    if (apiReply) {
      say(apiReply);
    } else {
      const catId = guessCategory(text);
      if (catId) {
        say(`It sounds like you're describing an incident. I'll file it for you…`);
        await fileFromChat(text);
      } else {
        say(
          "I'm not sure I understood. I can file reports (/report), check your /status, explain the /police, or list /hotlines. Type /help for the full list.",
        );
      }
    }
  };

  const fileFromChat = async (desc: string) => {
    const categoryId = guessCategory(desc) ?? 'other';
    say(`Got it. Reporting this under "${categoryId}":\n"${desc}"\nFiling now…`);
    const result = await submitReport({
      categoryId,
      description: desc,
      isAnonymous: false,
      incidentDate: new Date().toISOString().slice(0, 10),
      incidentTime: new Date().toTimeString().slice(0, 5),
    });
    if (result.ok) {
      say(
        `✅ Report filed and sent to the MENYESHA team.\nReference: ${result.reportId}\nYou can track it under \"Recent Reports\" on Home, or in the Reports tab.`,
      );
    } else {
      say('I could not file it (limit reached or details missing). Please use the Report tab for the full form.');
    }
  };

  return (
    <Screen contentStyle={styles.screenContent}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="sparkles" size={18} color={colors.white} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>ACP</Text>
          <Text style={styles.subtitle}>MENYESHA
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={styles.messages}
          keyboardShouldPersistTaps="handled"
        >
          {msgs.map((m, i) => (
            <View
              key={i}
              style={[styles.bubble, m.role === 'user' ? styles.userBubble : styles.acpBubble]}
            >
              <Text style={[styles.bubbleText, m.role === 'user' ? styles.userText : styles.acpText]}>
                {m.text}
              </Text>
            </View>
          ))}
          {typing ? (
            <View style={[styles.bubble, styles.acpBubble]}>
              <Text style={[styles.bubbleText, styles.acpText]}>ACP is typing…</Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.quickRow}>
          {QUICK_COMMANDS.map((c) => (
            <Pressable
              key={c}
              onPress={() => reply(c)}
              accessibilityRole="button"
              style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
            >
              <Text style={styles.chipText}>{c}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a command or describe the incident…"
            placeholderTextColor={colors.textFaint}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => {
              reply(input);
              setInput('');
            }}
            returnKeyType="send"
          />
          <Pressable
            onPress={() => {
              reply(input);
              setInput('');
            }}
            accessibilityRole="button"
            accessibilityLabel="Send"
            style={({ pressed }) => [styles.sendBtn, pressed && styles.pressed]}
          >
            <Ionicons name="send" size={18} color={colors.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    screenContent: { flex: 1, gap: spacing.sm },
    header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: { fontFamily: 'Manrope_800ExtraBold', fontSize: 16, color: colors.text },
    subtitle: { ...sans.tiny, color: colors.textMuted },
    messages: { gap: spacing.sm, paddingBottom: spacing.sm },
    bubble: { maxWidth: '86%', borderRadius: 14, padding: 12 },
    acpBubble: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    userBubble: { alignSelf: 'flex-end', backgroundColor: colors.brand },
    bubbleText: { fontSize: 14, lineHeight: 20 },
    acpText: { color: colors.text },
    userText: { color: '#fff' },
    quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, paddingVertical: spacing.xs },
    chip: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.pill,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    chipText: { ...sans.tiny, color: colors.brandForeground, fontSize: 12 },
    inputRow: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center' },
    input: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 15,
      color: colors.text,
    },
    sendBtn: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  });
