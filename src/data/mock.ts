import type { PointEntry, Report } from '@/types';

/** ISO string for `days` days ago, at a fixed hour so lists look tidy. */
function daysAgo(days: number, hour = 9): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 20, 0, 0);
  return d.toISOString();
}

function timeline(
  report: Omit<Report, 'timeline'>,
  reached: Report['status'],
): Report['timeline'] {
  const order: Report['status'][] = [
    'submitted',
    'received',
    'under_review',
    'verified',
    'action_taken',
  ];
  const reachedIndex = order.indexOf(reached);
  const created = new Date(report.createdAt).getTime();
  const span = Math.max(Date.now() - created, 1);
  return order.slice(0, reachedIndex + 1).map((status, index) => ({
    status,
    date: new Date(created + (span * index) / Math.max(reachedIndex, 1)).toISOString(),
  }));
}

type Seed = Omit<Report, 'timeline'> & { reached: Report['status'] };

function build(seed: Seed): Report {
  const { reached, ...rest } = seed;
  return { ...rest, timeline: timeline(rest, reached) };
}

/** The signed-in person in this mock. */
export const DEMO_USER = {
  id: 'me',
  username: 'Arsene',
  phone: '+250788123456',
  password: 'demo1234',
};

export const DEMO_VERIFY_CODE = '123456';

export const SEED_REPORTS: Report[] = [
  build({
    id: 'RPT-0248',
    authorId: 'me',
    categoryId: 'public_property',
    description: 'Public bench damaged at the bus stop. Broken wood and exposed nails.',
    location: { latitude: -1.9441, longitude: 30.0619 },
    area: 'Musanze',
    status: 'under_review',
    createdAt: daysAgo(1, 14),
    reached: 'under_review',
    duplicateOfId: null,
    linkedCount: 1,
    pointsEligible: true,
  }),
  build({
    id: 'RPT-0241',
    authorId: 'me',
    categoryId: 'vandalism',
    description: 'Graffiti on the wall of the community center.',
    location: { latitude: -1.9536, longitude: 30.041 },
    area: 'Musanze',
    status: 'verified',
    createdAt: daysAgo(3, 10),
    reached: 'verified',
    duplicateOfId: null,
    linkedCount: 1,
    pointsEligible: true,
  }),
  build({
    id: 'RPT-0235',
    authorId: 'me',
    categoryId: 'traffic',
    description: 'Traffic light not working at the main intersection.',
    location: { latitude: -1.9309, longitude: 30.1036 },
    area: 'Musanze',
    status: 'action_taken',
    createdAt: daysAgo(5, 8),
    reached: 'action_taken',
    duplicateOfId: null,
    linkedCount: 1,
    pointsEligible: true,
  }),
  build({
    id: 'RPT-0220',
    authorId: 'me',
    categoryId: 'crime',
    description: 'Suspicious individuals loitering near the school at night.',
    location: { latitude: -1.9274, longitude: 30.0924 },
    area: 'Musanze',
    status: 'verified',
    createdAt: daysAgo(7, 21),
    reached: 'verified',
    duplicateOfId: null,
    linkedCount: 1,
    pointsEligible: true,
  }),

  // Other people's reports
  build({
    id: 'RPT-0245',
    authorId: 'someone-else',
    categoryId: 'suspicious',
    description: 'Unknown person checking car doors late at night.',
    location: { latitude: -1.976, longitude: 30.068 },
    area: 'Musanze',
    status: 'under_review',
    createdAt: daysAgo(2, 11),
    reached: 'under_review',
    duplicateOfId: null,
    linkedCount: 1,
    pointsEligible: true,
  }),
  build({
    id: 'RPT-0238',
    authorId: 'someone-else',
    categoryId: 'public_property',
    description: 'Streetlight pole bent and hanging dangerously.',
    location: { latitude: -1.9547, longitude: 30.093 },
    area: 'Musanze',
    status: 'received',
    createdAt: daysAgo(4, 14),
    reached: 'received',
    duplicateOfId: null,
    linkedCount: 1,
    pointsEligible: true,
  }),
];

export const SEED_POINTS: PointEntry[] = [
  {
    id: 'pt-1',
    reportId: 'RPT-0241',
    label: 'Vandalism report verified',
    points: 50,
    status: 'confirmed',
    date: daysAgo(2),
  },
  {
    id: 'pt-2',
    reportId: 'RPT-0235',
    label: 'Traffic report action taken',
    points: 50,
    status: 'confirmed',
    date: daysAgo(4),
  },
  {
    id: 'pt-3',
    reportId: 'RPT-0220',
    label: 'Crime report verified',
    points: 75,
    status: 'confirmed',
    date: daysAgo(6),
  },
  {
    id: 'pt-4',
    reportId: 'RPT-0248',
    label: 'Public property damage',
    points: 50,
    status: 'pending',
    date: daysAgo(1),
  },
  {
    id: 'pt-5',
    reportId: 'RPT-0210',
    label: 'Helpful evidence bonus',
    points: 25,
    status: 'confirmed',
    date: daysAgo(10),
  },
  {
    id: 'pt-6',
    reportId: 'RPT-0205',
    label: 'Community tip confirmed',
    points: 15,
    status: 'confirmed',
    date: daysAgo(15),
  },
  {
    id: 'pt-7',
    reportId: 'RPT-0198',
    label: 'False report penalty',
    points: -30,
    status: 'removed',
    date: daysAgo(30),
  },
];

/** City-wide counters for the weekly stats block. */
export const SEED_WEEKLY = { filed: 1284, resolved: 431 };
