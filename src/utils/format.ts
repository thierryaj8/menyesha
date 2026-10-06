import type { GeoPoint } from '@/types';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const DAY = 24 * 60 * 60 * 1000;

/** Rough distance in km. Good enough for duplicate checks. */
export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const dLat = (b.latitude - a.latitude) * 111;
  const dLng = (b.longitude - a.longitude) * 111 * Math.cos((a.latitude * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

/** 240 -> "240" */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

/** 1 Point = 10 RWF */
export function pointsToRwf(points: number): number {
  return points * 10;
}

/** "18 Sep 2026" */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** "Today" / "Yesterday" / "3 days ago" / "18 Sep 2026" */
export function formatWhen(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today.getTime() - then) / DAY);
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(iso);
}

export function isSameDay(iso: string, reference = new Date()): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === reference.getFullYear() &&
    d.getMonth() === reference.getMonth() &&
    d.getDate() === reference.getDate()
  );
}

export function makeId(): string {
  const n = Math.floor(1000 + Math.random() * 8999);
  return `RPT-${n.toString().padStart(4, '0')}`;
}
