import { randomInt } from 'node:crypto';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../db.js';
import { HttpError } from '../errors.js';
import { authenticate } from '../middleware/authenticate.js';
import { isValidPhone, normalizePhone } from '../services/phone.js';
import { sendVerificationCode } from '../services/sms.js';
import { createAccessToken } from '../services/token.js';

export const authRouter = Router();

const signupSchema = z.object({
  username: z.string().trim().min(3).max(60),
  phone: z.string().trim().min(1),
  password: z.string().min(6).max(128),
});

const loginSchema = z.object({
  phone: z.string().trim().min(1),
  password: z.string().min(1).max(128),
});

const verifySchema = z.object({
  phone: z.string().trim().min(1),
  code: z.string().regex(/^\d{6}$/),
});

function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) throw new HttpError(400, result.error.issues[0]?.message ?? 'Invalid request');
  return result.data;
}

function publicUser(user: { id: string; username: string; phone: string }) {
  return { id: user.id, username: user.username, phone: user.phone };
}

authRouter.post('/signup', async (req, res) => {
  const input = parse(signupSchema, req.body);
  const phone = normalizePhone(input.phone);
  if (!isValidPhone(phone)) throw new HttpError(400, 'Enter a valid Rwanda phone number');

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) throw new HttpError(409, 'An account with this phone number already exists');

  const passwordHash = await bcrypt.hash(input.password, 12);
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  const codeHash = await bcrypt.hash(code, 10);

  const user = await prisma.user.create({
    data: {
      username: input.username,
      phone,
      passwordHash,
      verification: {
        create: {
          codeHash,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      },
    },
  });

  try {
    await sendVerificationCode(phone, code);
  } catch {
    await prisma.user.delete({ where: { id: user.id } });
    throw new HttpError(503, 'Verification message could not be sent');
  }

  res.status(201).json({ pendingPhone: phone });
});

authRouter.post('/verify', async (req, res) => {
  const input = parse(verifySchema, req.body);
  const phone = normalizePhone(input.phone);
  const user = await prisma.user.findUnique({
    where: { phone },
    include: { verification: true },
  });
  const challenge = user?.verification;

  if (!user || user.verifiedAt || !challenge || challenge.expiresAt <= new Date()) {
    throw new HttpError(400, 'Verification code is invalid or expired');
  }
  if (challenge.attempts >= 5) throw new HttpError(429, 'Too many verification attempts');

  const matches = await bcrypt.compare(input.code, challenge.codeHash);
  if (!matches) {
    const attempts = challenge.attempts + 1;
    await prisma.verificationChallenge.update({
      where: { id: challenge.id },
      data: { attempts },
    });
    if (attempts >= 5) throw new HttpError(429, 'Too many verification attempts');
    throw new HttpError(400, 'Verification code is invalid or expired');
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { verifiedAt: new Date() } }),
    prisma.verificationChallenge.delete({ where: { id: challenge.id } }),
  ]);

  res.json({ user: publicUser(user), accessToken: createAccessToken(user.id) });
});

authRouter.post('/login', async (req, res) => {
  const input = parse(loginSchema, req.body);
  const phone = normalizePhone(input.phone);
  if (!isValidPhone(phone)) throw new HttpError(400, 'Enter a valid Rwanda phone number');

  const user = await prisma.user.findUnique({ where: { phone } });
  const passwordMatches = user ? await bcrypt.compare(input.password, user.passwordHash) : false;
  if (!user || !passwordMatches) throw new HttpError(401, 'Phone number or password is incorrect');
  if (!user.verifiedAt) throw new HttpError(403, 'Verify your phone number before signing in');

  res.json({ user: publicUser(user), accessToken: createAccessToken(user.id) });
});

authRouter.get('/me', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.authUserId } });
  if (!user || !user.verifiedAt) throw new HttpError(401, 'Invalid or expired access token');
  res.json({ user: publicUser(user) });
});