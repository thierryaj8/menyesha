import type { ReportStatus } from '@prisma/client';

export const categories = ['crime', 'suspicious', 'vandalism', 'public_property', 'traffic', 'other'] as const;
export const dailyReportLimit = 5;
export const duplicateRadiusMeters = 250;
export const duplicateWindowDays = 14;

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export function distanceMeters(a: Coordinates, b: Coordinates): number {
  const radians = Math.PI / 180;
  const latitudeDelta = (b.latitude - a.latitude) * radians;
  const longitudeDelta = (b.longitude - a.longitude) * radians;
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(a.latitude * radians) *
      Math.cos(b.latitude * radians) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 6_371_000 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function startOfKigaliDay(now: Date): Date {
  const kigaliTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  return new Date(Date.UTC(
    kigaliTime.getUTCFullYear(),
    kigaliTime.getUTCMonth(),
    kigaliTime.getUTCDate(),
    -2,
  ));
}

export function startOfKigaliWeek(now: Date): Date {
  const dayStart = startOfKigaliDay(now);
  const kigaliDay = new Date(dayStart.getTime() + 2 * 60 * 60 * 1000).getUTCDay();
  const daysSinceMonday = (kigaliDay + 6) % 7;
  return new Date(dayStart.getTime() - daysSinceMonday * 24 * 60 * 60 * 1000);
}

export const terminalReportStatus: ReportStatus = 'action_taken';