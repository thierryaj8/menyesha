import { describe, expect, it } from 'vitest';
import { isValidPhone, normalizePhone } from './phone.js';

describe('Rwanda phone numbers', () => {
  it.each([
    ['0788 123 456', '+250788123456'],
    ['788123456', '+250788123456'],
    ['250788123456', '+250788123456'],
    ['+250 788 123 456', '+250788123456'],
  ])('normalizes %s to %s', (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
    expect(isValidPhone(input)).toBe(true);
  });

  it('rejects phone numbers from other country codes', () => {
    expect(normalizePhone('+1 202 555 0123')).toBe('');
    expect(isValidPhone('+1 202 555 0123')).toBe(false);
  });

  it('rejects Rwanda numbers with the wrong number of digits', () => {
    expect(isValidPhone('78812345')).toBe(false);
    expect(isValidPhone('7881234567')).toBe(false);
  });
});
