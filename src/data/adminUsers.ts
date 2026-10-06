import type { AdminUser } from '@/types';

export const ADMIN_USERS: AdminUser[] = [
  {
    id: 'admin-super-01',
    username: 'superadmin',
    email: 'superadmin@police.gov.rw',
    role: 'super_admin',
    isActive: true,
    createdAt: '2024-01-10T08:00:00Z',
    lastLoginAt: '2026-10-05T08:00:00Z',
    permissions: [
      'manage_departments',
      'manage_accounts',
      'manage_announcements',
      'manage_traffic_docs',
      'manage_posts',
      'manage_videos',
      'manage_photos',
      'manage_news',
      'manage_newsletters',
      'manage_ads',
      'manage_banners',
      'view_analytics',
      'manage_roles',
    ],
  },
  {
    id: 'admin-content-01',
    username: 'contentadmin',
    email: 'content@police.gov.rw',
    role: 'content_admin',
    isActive: true,
    createdAt: '2024-02-15T08:00:00Z',
    lastLoginAt: '2026-10-04T14:30:00Z',
    permissions: [
      'manage_posts',
      'manage_videos',
      'manage_photos',
      'manage_news',
      'manage_newsletters',
      'view_analytics',
    ],
  },
  {
    id: 'admin-police-01',
    username: 'policeadmin',
    email: 'policeadmin@police.gov.rw',
    role: 'police_admin',
    departmentId: 'rnp-hq',
    isActive: true,
    createdAt: '2024-03-01T08:00:00Z',
    lastLoginAt: '2026-10-05T09:15:00Z',
    permissions: [
      'manage_departments',
      'manage_accounts',
      'manage_announcements',
      'view_analytics',
    ],
  },
  {
    id: 'admin-traffic-01',
    username: 'trafficadmin',
    email: 'traffic.admin@police.gov.rw',
    role: 'traffic_admin',
    departmentId: 'traffic-police',
    isActive: true,
    createdAt: '2024-03-10T08:00:00Z',
    lastLoginAt: '2026-10-03T16:45:00Z',
    permissions: [
      'manage_traffic_docs',
      'manage_announcements',
      'view_analytics',
    ],
  },
  {
    id: 'admin-ads-01',
    username: 'adsadmin',
    email: 'ads@police.gov.rw',
    role: 'advertising_admin',
    isActive: true,
    createdAt: '2024-04-01T08:00:00Z',
    lastLoginAt: '2026-10-02T11:00:00Z',
    permissions: [
      'manage_ads',
      'manage_banners',
      'view_analytics',
    ],
  },
];

/** The mock "logged-in" admin for the demo. */
export const DEMO_ADMIN = ADMIN_USERS[0];

export function getAdminUser(id: string): AdminUser | undefined {
  return ADMIN_USERS.find((u) => u.id === id);
}

export function hasPermission(admin: AdminUser, permission: AdminUser['permissions'][number]): boolean {
  return admin.permissions.includes(permission);
}

export const ROLE_LABELS: Record<AdminUser['role'], string> = {
  super_admin: 'Super Admin',
  content_admin: 'Content Admin',
  police_admin: 'Police Admin',
  traffic_admin: 'Traffic Admin',
  advertising_admin: 'Advertising Admin',
};
