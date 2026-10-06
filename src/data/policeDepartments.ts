import type { PoliceDepartment } from '@/types';

export const POLICE_DEPARTMENTS: PoliceDepartment[] = [
  {
    id: 'rnp-hq',
    name: 'Rwanda National Police — Headquarters',
    shortName: 'RNP HQ',
    type: 'national',
    description:
      'The Rwanda National Police is the national law enforcement agency responsible for maintaining law and order, protecting life and property, and detecting and preventing crime across Rwanda.',
    location: 'Kacyiru, Kigali',
    contactPhone: '+250788310310',
    contactEmail: 'info@police.gov.rw',
    website: 'https://police.gov.rw',
    socialLinks: {
      facebook: 'https://facebook.com/RwandaPolice',
      twitter: 'https://twitter.com/Policeofkigali',
      youtube: 'https://youtube.com/@RwandaNationalPolice',
    },
    isVerified: true,
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
    postCount: 124,
    videoCount: 38,
    photoCount: 210,
    announcementCount: 67,
  },
  {
    id: 'traffic-police',
    name: 'Traffic Police Department',
    shortName: 'Traffic Police',
    type: 'traffic',
    description:
      'The Traffic Police Department enforces traffic laws, manages road safety campaigns, investigates traffic accidents, and ensures the smooth flow of traffic on all Rwandan roads.',
    location: 'Nyarugenge, Kigali',
    contactPhone: '+250788113113',
    contactEmail: 'traffic@police.gov.rw',
    website: 'https://police.gov.rw/traffic',
    socialLinks: {
      facebook: 'https://facebook.com/RNPTrafficPolice',
      twitter: 'https://twitter.com/RNPTraffic',
    },
    isVerified: true,
    isActive: true,
    createdAt: '2024-01-20T08:00:00Z',
    postCount: 89,
    videoCount: 25,
    photoCount: 145,
    announcementCount: 52,
  },
  {
    id: 'community-policing',
    name: 'Community Policing Department',
    shortName: 'Community Policing',
    type: 'community',
    description:
      'Community Policing works directly with local communities to prevent crime, build trust between citizens and police, and develop neighbourhood watch programmes across Rwanda.',
    location: 'Gasabo, Kigali',
    contactPhone: '+250788200200',
    contactEmail: 'community@police.gov.rw',
    isVerified: true,
    isActive: true,
    createdAt: '2024-02-01T08:00:00Z',
    postCount: 56,
    videoCount: 12,
    photoCount: 88,
    announcementCount: 34,
  },
  {
    id: 'kigali-metro',
    name: 'Kigali Metropolitan Police',
    shortName: 'KMP',
    type: 'regional',
    description:
      'The Kigali Metropolitan Police covers all three districts of Kigali — Nyarugenge, Gasabo, and Kicukiro — handling urban law enforcement, public events, and city-wide operations.',
    location: 'Nyarugenge, Kigali',
    contactPhone: '+250788412412',
    contactEmail: 'kigali@police.gov.rw',
    socialLinks: {
      facebook: 'https://facebook.com/KigaliMetroPolice',
    },
    isVerified: true,
    isActive: true,
    createdAt: '2024-02-10T08:00:00Z',
    postCount: 72,
    videoCount: 18,
    photoCount: 130,
    announcementCount: 41,
  },
  {
    id: 'northern-region',
    name: 'Northern Region Police',
    shortName: 'Northern Police',
    type: 'regional',
    description:
      'The Northern Region Police serves Musanze, Burera, Gakenke, Gicumbi, and Rulindo districts, handling law enforcement and community safety in the Northern Province.',
    location: 'Musanze, Northern Province',
    contactPhone: '+250788500500',
    contactEmail: 'north@police.gov.rw',
    isVerified: true,
    isActive: true,
    createdAt: '2024-03-01T08:00:00Z',
    postCount: 34,
    videoCount: 8,
    photoCount: 62,
    announcementCount: 22,
  },
  {
    id: 'anti-corruption',
    name: 'Anti-Corruption & Economic Crimes Unit',
    shortName: 'ACEC Unit',
    type: 'specialized',
    description:
      'The Anti-Corruption and Economic Crimes Unit investigates financial crimes, corruption, fraud, and economic offences that threaten the integrity of Rwanda\'s public institutions.',
    location: 'Kacyiru, Kigali',
    contactPhone: '+250788600600',
    contactEmail: 'acec@police.gov.rw',
    website: 'https://police.gov.rw/acec',
    isVerified: true,
    isActive: true,
    createdAt: '2024-03-15T08:00:00Z',
    postCount: 18,
    videoCount: 4,
    photoCount: 28,
    announcementCount: 15,
  },
];

export function getDepartment(id: string): PoliceDepartment | undefined {
  return POLICE_DEPARTMENTS.find((d) => d.id === id);
}

export function getVerifiedDepartments(): PoliceDepartment[] {
  return POLICE_DEPARTMENTS.filter((d) => d.isVerified && d.isActive);
}
