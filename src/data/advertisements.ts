import type { Advertisement } from '@/types';

export const ADVERTISEMENTS: Advertisement[] = [
  {
    id: 'ad-001',
    campaignName: 'Road Safety 2026',
    adType: 'banner',
    title: 'Drive Safely. Protect Every Life.',
    description:
      'The Traffic Police reminds all drivers to observe speed limits, wear seat belts, and avoid phone use while driving. Zero tolerance for drunk driving.',
    imageUri: undefined,
    destinationUrl: 'https://police.gov.rw/traffic/road-safety',
    startDate: '2026-09-01T00:00:00Z',
    endDate: '2026-12-31T23:59:59Z',
    targetPage: 'home',
    status: 'active',
    departmentId: 'traffic-police',
    impressions: 14520,
    clicks: 1230,
    views: 14520,
    shares: 87,
    createdAt: '2026-08-25T10:00:00Z',
    createdBy: 'admin-traffic-01',
  },
  {
    id: 'ad-002',
    campaignName: 'Crime Prevention Q4 2026',
    adType: 'image',
    title: 'See Something, Say Something',
    description:
      'Help us keep your community safe. Report suspicious activity to the nearest police station or call 112.',
    imageUri: undefined,
    destinationUrl: 'https://police.gov.rw/crime-prevention',
    startDate: '2026-10-01T00:00:00Z',
    endDate: '2026-12-31T23:59:59Z',
    targetPage: 'discover',
    status: 'active',
    departmentId: 'rnp-hq',
    impressions: 8740,
    clicks: 562,
    views: 8740,
    shares: 43,
    createdAt: '2026-09-20T09:00:00Z',
    createdBy: 'admin-content-01',
  },
  {
    id: 'ad-003',
    campaignName: 'Traffic Rules Awareness',
    adType: 'campaign',
    title: 'Know the Rules of the Road',
    description:
      'Access the complete guide to Rwanda traffic laws, road signs, and driving regulations. Available in English, Kinyarwanda, and French.',
    imageUri: undefined,
    destinationUrl: 'https://police.gov.rw/traffic/rules',
    startDate: '2026-08-01T00:00:00Z',
    endDate: '2026-11-30T23:59:59Z',
    targetPage: 'traffic',
    status: 'active',
    departmentId: 'traffic-police',
    impressions: 22100,
    clicks: 3400,
    views: 22100,
    shares: 210,
    createdAt: '2026-07-28T14:00:00Z',
    createdBy: 'admin-traffic-01',
  },
  {
    id: 'ad-004',
    campaignName: 'Community Policing Recruitment',
    adType: 'image',
    title: 'Join Your Community Police Forum',
    description:
      'Be part of the solution. Community Policing Forums (CPFs) meet monthly to discuss safety concerns and build stronger neighbourhoods.',
    imageUri: undefined,
    destinationUrl: 'https://police.gov.rw/community',
    startDate: '2026-11-01T00:00:00Z',
    endDate: '2027-02-28T23:59:59Z',
    targetPage: 'announcements',
    status: 'scheduled',
    departmentId: 'community-policing',
    impressions: 0,
    clicks: 0,
    views: 0,
    shares: 0,
    createdAt: '2026-10-01T11:00:00Z',
    createdBy: 'admin-police-01',
  },
  {
    id: 'ad-005',
    campaignName: 'GBV Awareness Month',
    adType: 'video',
    title: 'Speak Out. We Are Listening.',
    description:
      'Gender-Based Violence is a crime. If you or someone you know is in danger, call 3512. Help is available 24/7.',
    imageUri: undefined,
    videoUri: undefined,
    destinationUrl: 'https://police.gov.rw/gbv',
    startDate: '2026-10-01T00:00:00Z',
    endDate: '2026-10-31T23:59:59Z',
    targetPage: 'all',
    status: 'active',
    departmentId: 'rnp-hq',
    impressions: 6300,
    clicks: 890,
    views: 5100,
    shares: 156,
    createdAt: '2026-09-25T08:00:00Z',
    createdBy: 'admin-content-01',
  },
];

export function getActiveAds(targetPage?: Advertisement['targetPage']): Advertisement[] {
  const now = new Date().toISOString();
  return ADVERTISEMENTS.filter((ad) => {
    const isActive = ad.status === 'active';
    const inWindow = ad.startDate <= now && ad.endDate >= now;
    const matchesPage = !targetPage || ad.targetPage === targetPage || ad.targetPage === 'all';
    return isActive && inWindow && matchesPage;
  });
}
