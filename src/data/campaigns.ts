import type { Campaign } from '@/types';

export const CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-001',
    title: 'Drive to Arrive Alive',
    description:
      'October is Road Safety Month. Wear your seatbelt, respect speed limits, and never drive under the influence. Together we can reduce road fatalities across Rwanda.',
    imageUri: 'https://www.police.gov.rw/campaigns/drive-to-arrive-alive.jpg',
    slot: 'home_banner',
    topic: 'Road Safety',
    startsAt: '2026-10-01T00:00:00.000Z',
    endsAt: '2026-10-31T23:59:59.000Z',
    cta: { label: 'Learn More', url: 'https://www.police.gov.rw/road-safety' },
    views: 14820,
    clicks: 2340,
    isActive: true,
  },
  {
    id: 'camp-002',
    title: 'Report, Don\'t Ignore — Community Safety',
    description:
      'Your report matters. Every verified report helps Rwanda National Police respond faster. Use FixRwanda to report crimes, road hazards, and public safety issues in your community.',
    imageUri: 'https://www.police.gov.rw/campaigns/report-dont-ignore.jpg',
    slot: 'general',
    topic: 'Crime Prevention',
    startsAt: '2026-09-01T00:00:00.000Z',
    endsAt: '2026-11-30T23:59:59.000Z',
    cta: { label: 'Start Reporting', url: '' },
    views: 8450,
    clicks: 1890,
    isActive: true,
  },
  {
    id: 'camp-003',
    title: 'Helmet Up — Motorcycle Safety',
    description:
      'Motorcycle helmets save lives. All motorcycle riders and passengers are required by law to wear helmets at all times. Police will be conducting helmet checks on all major roads throughout October.',
    imageUri: 'https://www.police.gov.rw/campaigns/helmet-up.jpg',
    slot: 'traffic',
    topic: 'Road Safety',
    startsAt: '2026-10-01T00:00:00.000Z',
    endsAt: '2026-10-31T23:59:59.000Z',
    cta: { label: 'Read the Rules', url: '' },
    views: 5200,
    clicks: 870,
    isActive: true,
  },
  {
    id: 'camp-004',
    title: 'Gender-Based Violence: Speak Up',
    description:
      'GBV is a crime. If you witness or experience gender-based violence, call the GBV hotline on 3512 or report through FixRwanda. All reports are handled with strict confidentiality.',
    imageUri: 'https://www.police.gov.rw/campaigns/gbv-speak-up.jpg',
    slot: 'announcements',
    topic: 'Community Safety',
    startsAt: '2026-09-15T00:00:00.000Z',
    endsAt: '2026-12-15T23:59:59.000Z',
    cta: { label: 'Get Help', url: '' },
    views: 3100,
    clicks: 520,
    isActive: true,
  },
  {
    id: 'camp-005',
    title: 'Kigali Marathon — Traffic Safety Guide',
    description:
      'Attending the Kigali International Marathon on 5 October? Know your routes and parking zones. Traffic officers will be on duty from 05:00 to guide spectators and participants safely.',
    slot: 'traffic',
    topic: 'Event Safety',
    startsAt: '2026-09-28T00:00:00.000Z',
    endsAt: '2026-10-05T23:59:59.000Z',
    views: 1980,
    clicks: 420,
    isActive: true,
  },
];

/** Returns the campaign to display on the home screen banner (most recent active home_banner). */
export function getActiveBannerCampaign(now = new Date()): Campaign | null {
  const active = CAMPAIGNS.filter(
    (c) =>
      c.isActive &&
      c.slot === 'home_banner' &&
      new Date(c.startsAt) <= now &&
      new Date(c.endsAt) >= now,
  );
  if (active.length === 0) return null;
  // Most recently started
  return active.sort(
    (a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
  )[0] ?? null;
}
