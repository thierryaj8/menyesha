export function normalizeRwandaPhone(raw: string): string {
  const compact = raw.trim().replace(/[\s().-]/g, '');
  const digits = compact.replace(/\D/g, '');

  if (compact.startsWith('+') && !compact.startsWith('+250')) return '';
  if (compact.startsWith('+250')) return `+250${digits.slice(3)}`;
  if (!compact.startsWith('+') && digits.startsWith('250') && digits.length > 9) {
    return `+250${digits.slice(3)}`;
  }
  if (digits.startsWith('0') && digits.length === 10) return `+250${digits.slice(1)}`;
  return `+250${digits}`;
}

export function isValidRwandaPhone(raw: string): boolean {
  return /^\+250\d{9}$/.test(normalizeRwandaPhone(raw));
}
