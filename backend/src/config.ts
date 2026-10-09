import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  WEB_ORIGINS: z.string().default('http://localhost:8081,http://localhost:19006'),
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