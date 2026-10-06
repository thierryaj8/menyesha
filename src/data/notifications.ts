import type { AppNotification } from '@/types';

/**
 * Citizen notification feed.
 *
 * Sources are the same official records the Discover area publishes, so an
 * urgent announcement or a report status change lands here too.
 */
export const NOTIFICATIONS: AppNotification[] = [
  {
    id: 'ntf-001',
    kind: 'announcement',
    title: 'Urgent: KN 5 Road closed at Kimironko Bridge',
    body: 'Traffic between Kimironko roundabout and Remera junction is closed until 4 October. Use KG 11 Avenue instead.',
    route: '/police/announcements/ann-001',
    createdAt: '2026-10-02T05:35:00.000Z',
    isRead: false,
    isUrgent: true,
  },
  {
    id: 'ntf-002',
    kind: 'report_status',
    title: 'Your report moved to Under Review',
    body: 'Report RPT-4412 is being checked by the responding team. You will be notified when the status changes.',
    route: '/report/RPT-0248',
    createdAt: '2026-10-02T07:15:00.000Z',
    isRead: false,
  },
  {
    id: 'ntf-003',
    kind: 'points',
    title: 'You earned 50 Points',
    body: 'Report RPT-4390 was verified and action was taken. 50 Points were added to your balance.',
    route: '/rewards',
    createdAt: '2026-10-01T16:40:00.000Z',
    isRead: true,
  },
  {
    id: 'ntf-004',
    kind: 'campaign',
    title: 'Road Safety Campaign 2026 is live',
    body: 'Drive to Arrive Alive. Checkpoints are active on major roads nationwide throughout October.',
    route: '/police/campaigns',
    createdAt: '2026-10-01T08:10:00.000Z',
    isRead: true,
  },
  {
    id: 'ntf-005',
    kind: 'traffic_doc',
    title: 'Road Signs manual updated to v3.2',
    body: 'The official road signs and road-markings guide was revised. Download the newest Kinyarwanda and French versions.',
    route: '/police/traffic',
    createdAt: '2026-09-30T09:00:00.000Z',
    isRead: true,
  },
  {
    id: 'ntf-006',
    kind: 'newsletter',
    title: 'September 2026 newsletter published',
    body: 'The monthly police bulletin covers the road safety campaign, community policing forums, and new traffic regulations.',
    route: '/police/newsletters',
    createdAt: '2026-09-29T06:00:00.000Z',
    isRead: true,
  },
  {
    id: 'ntf-007',
    kind: 'announcement',
    title: 'Flood risk alert for Nyagatare',
    body: 'Avoid low-lying roads near the Muvumba River crossing between 3 and 6 October.',
    route: '/police/announcements/ann-008',
    createdAt: '2026-10-02T06:05:00.000Z',
    isRead: false,
    isUrgent: true,
  },
];