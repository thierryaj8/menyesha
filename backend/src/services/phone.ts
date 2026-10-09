export function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, '');
  if (digits.startsWith('+250')) return `+250${digits.slice(4).replace(/\D/g, '')}`;
  if (digits.startsWith('250')) return `+250${digits.slice(3).replace(/\D/g, '')}`;
  if (digits.startsWith('0')) return `+250${digits.slice(1).replace(/\D/g, '')}`;
  return `+250${digits.replace(/\D/g, '')}`;
}

export function isValidPhone(phone: string): boolean {
  return /^\+250\d{9}$/.test(normalizePhone(phone));
}