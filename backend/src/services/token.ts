import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config.js';

export type StaffAccountType = 'admin' | 'department';

export function createAccessToken(userId: string): string {
  return jwt.sign({ sub: userId, accountType: 'citizen' }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  });
}

export function createStaffAccessToken(accountId: string, accountType: StaffAccountType): string {
  return jwt.sign({ sub: accountId, accountType }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  });
}

export function readAccessToken(token: string): string {
  const payload = jwt.verify(token, env.JWT_SECRET);
  if (
    typeof payload === 'string'
    || typeof payload.sub !== 'string'
    || (payload.accountType !== undefined && payload.accountType !== 'citizen')
  ) {
    throw new Error('Invalid access token');
  }
  return payload.sub;
}

export function readStaffAccessToken(token: string): { id: string; accountType: StaffAccountType } {
  const payload = jwt.verify(token, env.JWT_SECRET);
  if (
    typeof payload === 'string'
    || typeof payload.sub !== 'string'
    || (payload.accountType !== 'admin' && payload.accountType !== 'department')
  ) {
    throw new Error('Invalid staff access token');
  }
  return { id: payload.sub, accountType: payload.accountType };
}