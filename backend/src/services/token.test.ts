import { describe, expect, it } from 'vitest';
import {
  createAccessToken,
  createStaffAccessToken,
  readAccessToken,
  readStaffAccessToken,
} from './token.js';

describe('access token account types', () => {
  it('accepts citizen tokens only in the citizen token reader', () => {
    const token = createAccessToken('citizen-id');

    expect(readAccessToken(token)).toBe('citizen-id');
    expect(() => readStaffAccessToken(token)).toThrow();
  });

  it('accepts staff tokens only in the staff token reader', () => {
    const token = createStaffAccessToken('staff-id', 'department');

    expect(readStaffAccessToken(token)).toEqual({
      id: 'staff-id',
      accountType: 'department',
    });
    expect(() => readAccessToken(token)).toThrow();
  });
});
