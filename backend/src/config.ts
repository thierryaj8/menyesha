import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  WEB_ORIGINS: z.string().default('http://localhost:8081,http://localhost:19006'),
  CODESPACE_NAME: z.string().optional(),
  GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN: z.string().default('app.github.dev'),
  SMS_MODE: z.enum(['console', 'webhook']).default('console'),
  SMS_WEBHOOK_URL: z.string().url().optional().or(z.literal('')),
  SMS_WEBHOOK_TOKEN: z.string().optional(),
});

export const env = schema.parse(process.env);

if (env.NODE_ENV === 'production' && env.SMS_MODE !== 'webhook') {
  throw new Error('SMS_MODE=webhook is required in production');
}

if (env.SMS_MODE === 'webhook' && (!env.SMS_WEBHOOK_URL || !env.SMS_WEBHOOK_TOKEN)) {
  throw new Error('SMS_WEBHOOK_URL and SMS_WEBHOOK_TOKEN are required for webhook SMS');
}

export const webOrigins = env.WEB_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean);

export function isCodespacesOrigin(
  origin: string | undefined,
  workspaceName: string | undefined,
  forwardingDomain: string,
): boolean {
  if (!origin || !workspaceName) return false;

  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }

  const domainSuffix = `.${forwardingDomain}`;
  if (url.protocol !== 'https:' || !url.hostname.endsWith(domainSuffix)) return false;

  const workspacePort = url.hostname.slice(workspaceName.length + 1, -domainSuffix.length);
  return url.hostname.startsWith(`${workspaceName}-`) && /^\d+$/.test(workspacePort);
}

export function isAllowedWebOrigin(origin: string | undefined): boolean {
  if (!origin || webOrigins.includes(origin)) return true;
  return isCodespacesOrigin(
    origin,
    env.CODESPACE_NAME,
    env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN,
  );
}