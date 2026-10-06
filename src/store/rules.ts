import type { GeoPoint, Report } from '@/types';

/** Two reports this close (km) in the same category count as the same problem. */
export const DUPLICATE_RADIUS_KM = 0.25;
/** ...within this window, in days. */
export const DUPLICATE_WINDOW_DAYS = 14;
/** How many reports one person may send per day. */
export const DAILY_REPORT_LIMIT = 5;

/**
 * Duplicate detection: same category, close location, recent, still open.
 * Returns the older report the new one should be linked to, or null.
 */
export function findNearbyDuplicate(
  reports: Report[],
  input: { categoryId: string; location: GeoPoint },
): Report | null {
  const now = Date.now();
  const windowMs = DUPLICATE_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  for (const report of reports) {
    if (report.categoryId !== input.categoryId) continue;
    if (report.duplicateOfId) continue; // link to the original, never to a duplicate
    if (report.status === 'action_taken') continue; // fixed problems can be reported again
    if (now - new Date(report.createdAt).getTime() > windowMs) continue;

    const dLat = Math.abs(input.location.latitude - report.location.latitude) * 111;
    const dLng =
      Math.abs(input.location.longitude - report.location.longitude) *
      111 *
      Math.cos((input.location.latitude * Math.PI) / 180);
    const distance = Math.sqrt(dLat * dLat + dLng * dLng);
    if (distance <= DUPLICATE_RADIUS_KM) return report;
  }

  return null;
}

/** True once the person hit the daily limit. */
export function isRateLimited(sentToday: string[]): boolean {
  const today = new Date().toDateString();
  return sentToday.filter((iso) => new Date(iso).toDateString() === today).length >= DAILY_REPORT_LIMIT;
}
