import * as Location from 'expo-location';
import { KIGALI_AREAS, KIGALI_CENTER } from '@/data/kigali';
import type { GeoPoint } from '@/types';
import { distanceKm } from '@/utils/format';

const KIGALI_CENTER_LABEL = 'Kigali city centre';

/** Closest known Kigali sector — used as the public label for a point. */
export function nearestArea(point: GeoPoint): string {
  let best = KIGALI_AREAS[0];
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const area of KIGALI_AREAS) {
    const distance = distanceKm(point, area);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = area;
    }
  }

  // Far outside Kigali (for example a desktop browser) — do not pretend.
  if (bestDistance > 25) return KIGALI_CENTER_LABEL;
  return best.name;
}

export interface LocatedPoint {
  location: GeoPoint;
  area: string;
  exact: boolean;
}

/**
 * Reads the device location. Falls back to central Kigali when permission is
 * refused or the sensor has nothing to offer, so the flow never gets stuck.
 */
export async function getMyLocation(): Promise<LocatedPoint> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      return { location, area: nearestArea(location), exact: true };
    }
  } catch {
    // Fall through to the default.
  }

  return { location: KIGALI_CENTER, area: KIGALI_CENTER_LABEL, exact: false };
}
