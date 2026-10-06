import type { Hotline } from '@/types';

/**
 * Emergency hotlines. Reachable without logging in, from the login screen
 * and from inside the app, always as a bottom sheet.
 */
export const HOTLINES: Hotline[] = [
  { number: '112', labelKey: 'hotline.112' },
  { number: '912', labelKey: 'hotline.912' },
  { number: '111', labelKey: 'hotline.111' },
  { number: '113', labelKey: 'hotline.113' },
  { number: '3512', labelKey: 'hotline.3512' },
  { number: '116', labelKey: 'hotline.116' },
];

/** Sectors used when GPS is unavailable, and to test duplicate matching. */
export const KIGALI_AREAS = [
  { name: 'Kigali city centre', latitude: -1.9441, longitude: 30.0619 },
  { name: 'Kimironko', latitude: -1.9309, longitude: 30.1036 },
  { name: 'Remera', latitude: -1.9547, longitude: 30.093 },
  { name: 'Kacyiru', latitude: -1.9274, longitude: 30.0924 },
  { name: 'Nyarugenge', latitude: -1.947, longitude: 30.042 },
  { name: 'Nyamirambo', latitude: -1.9536, longitude: 30.041 },
  { name: 'Gikondo', latitude: -1.968, longitude: 30.056 },
  { name: 'Kicukiro', latitude: -1.976, longitude: 30.068 },
  { name: 'Kanombe', latitude: -1.964, longitude: 30.127 },
  { name: 'Gacuriro', latitude: -1.923, longitude: 30.093 },
];

export const KIGALI_CENTER = { latitude: -1.9441, longitude: 30.0619 };
