import type { WebBanner } from '@/types';

export const WEB_BANNERS: WebBanner[] = [
  {
    id: 'banner-001',
    title: 'Emergency Hotlines Available 24/7',
    imageUri: undefined,
    bannerText: 'Police: 112 · Ambulance: 912 · Fire: 111',
    ctaLabel: 'View all emergency numbers',
    ctaUrl: '/emergency',
    location: 'home',
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2027-01-01T00:00:00Z',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
    createdBy: 'admin-super-01',
  },
  {
    id: 'banner-002',
    title: 'New Traffic Regulations — Effective November 2026',
    imageUri: undefined,
    bannerText: 'Updated speed limits and road-sign requirements now in effect.',
    ctaLabel: 'Read the full regulations',
    ctaUrl: '/police/traffic',
    location: 'traffic',
    startDate: '2026-10-15T00:00:00Z',
    endDate: '2026-12-31T23:59:59Z',
    status: 'active',
    createdAt: '2026-10-10T09:00:00Z',
    createdBy: 'admin-traffic-01',
  },
  {
    id: 'banner-003',
    title: 'Discover Official Police Channels',
    imageUri: undefined,
    bannerText: 'Follow Rwanda National Police on social media for real-time updates.',
    ctaLabel: 'See official accounts',
    ctaUrl: '/police/accounts',
    location: 'discover',
    startDate: '2026-09-01T00:00:00Z',
    endDate: '2026-11-30T23:59:59Z',
    status: 'active',
    createdAt: '2026-08-28T10:00:00Z',
    createdBy: 'admin-content-01',
  },
  {
    id: 'banner-004',
    title: 'October: Road Safety Month',
    imageUri: undefined,
    bannerText: "Join RNP's Road Safety campaign. Report hazards. Drive responsibly.",
    ctaLabel: 'Learn more',
    ctaUrl: '/police/campaigns',
    location: 'home',
    startDate: '2026-10-01T00:00:00Z',
    endDate: '2026-10-31T23:59:59Z',
    status: 'active',
    createdAt: '2026-09-28T08:00:00Z',
    createdBy: 'admin-super-01',
  },
  {
    id: 'banner-005',
    title: 'Department Profiles Now Live',
    imageUri: undefined,
    bannerText: 'Explore official profiles for all Rwanda National Police departments.',
    ctaLabel: 'View departments',
    ctaUrl: '/discover/departments',
    location: 'departments',
    startDate: '2026-10-05T00:00:00Z',
    endDate: '2026-12-31T23:59:59Z',
    status: 'active',
    createdAt: '2026-10-04T12:00:00Z',
    createdBy: 'admin-police-01',
  },
  {
    id: 'banner-006',
    title: 'Year-End Newsletter — Coming December 2026',
    imageUri: undefined,
    bannerText: 'The annual review edition arrives in December. Subscribe for early access.',
    ctaLabel: 'Subscribe',
    ctaUrl: '/police/newsletters',
    location: 'announcements',
    startDate: '2026-11-15T00:00:00Z',
    endDate: '2026-12-31T23:59:59Z',
    status: 'scheduled',
    createdAt: '2026-10-03T14:00:00Z',
    createdBy: 'admin-content-01',
  },
];

export function getActiveBanners(location?: WebBanner['location']): WebBanner[] {
  const now = new Date().toISOString();
  return WEB_BANNERS.filter((b) => {
    const isActive = b.status === 'active';
    const inWindow = b.startDate <= now && b.endDate >= now;
    const matchesLocation = !location || b.location === location;
    return isActive && inWindow && matchesLocation;
  });
}
