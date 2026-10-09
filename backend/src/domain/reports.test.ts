import { describe, expect, it } from 'vitest';
import { distanceMeters, startOfKigaliDay, startOfKigaliWeek } from './reports.js';

describe('report rules', () => {
  it('measures distance between report pins in meters', () => {
    const kigali = { latitude: -1.9441, longitude: 30.0619 };
    expect(distanceMeters(kigali, kigali)).toBe(0);
    expect(distanceMeters(kigali, { ...kigali, latitude: kigali.latitude + 0.001 })).toBeGreaterThan(100);
    expect(distanceMeters(kigali, { ...kigali, latitude: kigali.latitude + 0.001 })).toBeLessThan(120);
  });

  it('starts a report day at midnight in Kigali', () => {
    expect(startOfKigaliDay(new Date('2026-10-09T11:00:00.000Z')).toISOString())
      .toBe('2026-10-08T22:00:00.000Z');
    expect(startOfKigaliDay(new Date('2026-10-08T22:00:00.000Z')).toISOString())
      .toBe('2026-10-08T22:00:00.000Z');
  });

  it('starts weekly statistics on Monday in Kigali', () => {
    expect(startOfKigaliWeek(new Date('2026-10-11T12:00:00.000Z')).toISOString())
      .toBe('2026-10-04T22:00:00.000Z');
  });
});