import { env } from '../config.js';

export async function sendVerificationCode(phone: string, code: string): Promise<void> {
  const message = `Your Menyesha verification code is ${code}. It expires in 10 minutes.`;

  if (env.SMS_MODE === 'console') {
    console.info(`[development SMS] to=${phone} message="${message}"`);
    return;
  }

  const response = await fetch(env.SMS_WEBHOOK_URL!, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.SMS_WEBHOOK_TOKEN}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ to: phone, message }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) throw new Error(`SMS provider returned ${response.status}`);
}