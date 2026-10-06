import type { AdminActivity } from '@/types';

/**
 * Recent administrative activity shown on the admin dashboard.
 * Newest first.
 */
export const ADMIN_ACTIVITY: AdminActivity[] = [
  {
    id: 'act-001',
    action: 'published',
    description: 'Published urgent notice — KN 5 Road, Kimironko Bridge',
    actor: 'superadmin',
    area: 'police',
    at: '2026-10-02T05:30:00.000Z',
  },
  {
    id: 'act-002',
    action: 'updated',
    description: 'Road Signs and Road Markings guide revised to v3.2',
    actor: 'trafficadmin',
    area: 'traffic',
    at: '2026-10-01T14:20:00.000Z',
  },
  {
    id: 'act-003',
    action: 'scheduled',
    description: 'Scheduled Road Safety Campaign 2026 web banner on Home',
    actor: 'adsadmin',
    area: 'advertising',
    at: '2026-10-01T11:05:00.000Z',
  },
  {
    id: 'act-004',
    action: 'verified',
    description: 'Verified Gasabo District Police Post account',
    actor: 'policeadmin',
    area: 'police',
    at: '2026-10-01T09:12:00.000Z',
  },
  {
    id: 'act-005',
    action: 'published',
    description: 'Published news article — Community policing in Gasabo',
    actor: 'contentadmin',
    area: 'content',
    at: '2026-09-30T16:40:00.000Z',
  },
  {
    id: 'act-006',
    action: 'unpublished',
    description: 'Unpaused traffic-safety video pending review',
    actor: 'contentadmin',
    area: 'content',
    at: '2026-09-30T10:15:00.000Z',
  },
  {
    id: 'act-007',
    action: 'archived',
    description: 'Archived June 2025 public-transport flyer',
    actor: 'trafficadmin',
    area: 'traffic',
    at: '2026-09-29T08:50:00.000Z',
  },
  {
    id: 'act-008',
    action: 'suspended',
    description: 'Suspended unofficial motorcycle-taxi account claim',
    actor: 'policeadmin',
    area: 'police',
    at: '2026-09-28T13:30:00.000Z',
  },
];