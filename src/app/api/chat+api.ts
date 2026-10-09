/**
 * Secure server-side proxy for the ACP assistant.
 *
 * The OpenAI key lives only on the server (read from `.env.local`) and is
 * never shipped in the Expo client bundle. The app calls POST /api/chat.
 */

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4o-mini';

const SYSTEM_PROMPT =
  'You are ACP, the friendly MENYESHA civic-safety assistant for Rwanda. Answer briefly about: reporting incidents, Rwanda National Police information, emergency numbers (112 police, 113 traffic), and community safety. Always point users to call 112 for immediate danger. If they describe an incident, confirm what you understood and tell them you are filing a report.';

function clean(status: number, error: string) {
  return Response.json({ error }, { status });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return clean(400, 'Invalid request body.');
  }

  const messages = (body as { messages?: unknown })?.messages;
  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages.some(
      (m) =>
        typeof m !== 'object' ||
        m === null ||
        typeof (m as { content?: unknown }).content !== 'string' ||
        !(m as { content: string }).content.trim(),
    )
  ) {
    return clean(400, 'Please enter a message.');
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_SECRET_KEY') {
    return clean(503, 'ACP is not configured with an AI backend yet. Please try again later.');
  }
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;

  try {
    const res = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 400,
        temperature: 0.5,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      }),
    });

    if (res.status === 401) {
      return clean(502, 'ACP credentials are invalid. Please contact the administrator.');
    }
    if (res.status === 429) {
      return clean(429, 'Too many requests. Please wait a moment and try again.');
    }
    if (!res.ok) {
      return clean(502, 'The assistant is unavailable right now. Please try again later.');
    }

    const json = await res.json();
    const reply = json?.choices?.[0]?.message?.content;
    if (typeof reply !== 'string' || !reply.trim()) {
      return clean(502, 'The assistant returned an empty response. Please try again.');
    }
    return Response.json({ reply });
  } catch {
    return clean(502, 'Could not reach the assistant. Check your connection and try again.');
  }
}
