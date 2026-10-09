/**
 * ACP chat service.
 *
 * The mobile app never talks to OpenAI directly. It POSTs recent chat
 * history to our own server-side endpoint (`/api/chat`), which holds the
 * API key and proxies the request to OpenAI.
 */

interface Turn {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const FRIENDLY_ERROR =
  "Sorry, I couldn't get a response from the assistant. Please try again in a moment. Type /help to see what I can do offline.";

export async function chatWithAssistant(history: Turn[]): Promise<string> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = json?.error;
      return typeof msg === 'string' && msg ? msg : FRIENDLY_ERROR;
    }
    const reply = json?.reply;
    return typeof reply === 'string' && reply.trim() ? reply : FRIENDLY_ERROR;
  } catch {
    return FRIENDLY_ERROR;
  }
}
