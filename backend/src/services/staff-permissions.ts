import type { AdminRole, CmsResource } from '@prisma/client';

export type AdminPermission =
  | 'manage_departments'
  | 'manage_accounts'
  | 'manage_announcements'
  | 'manage_traffic_docs'
  | 'manage_posts'
  | 'manage_videos'
  | 'manage_photos'
  | 'manage_news'
  | 'manage_newsletters'
  | 'manage_ads'
  | 'manage_banners'
  | 'view_analytics'
  | 'manage_roles';

export const adminPermissions: Record<AdminRole, AdminPermission[]> = {
  super_admin: [
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
  content_admin: [
    'manage_posts',
    'manage_videos',
    'manage_photos',
    'manage_news',
    'manage_newsletters',
    'view_analytics',
  ],
  police_admin: ['manage_departments', 'manage_accounts', 'manage_announcements', 'view_analytics'],
  traffic_admin: ['manage_traffic_docs', 'manage_announcements', 'view_analytics'],
  advertising_admin: ['manage_ads', 'manage_banners', 'view_analytics'],
};

export const resourcePermissions: Record<CmsResource, AdminPermission> = {
  announcement: 'manage_announcements',
  traffic_doc: 'manage_traffic_docs',
  article: 'manage_news',
  newsletter: 'manage_newsletters',
  discover_post: 'manage_posts',
  discover_video: 'manage_videos',
  discover_photo: 'manage_photos',
  advertisement: 'manage_ads',
  web_banner: 'manage_banners',
  campaign: 'manage_ads',
};

export function permissionsForRole(role: AdminRole): AdminPermission[] {
  return [...adminPermissions[role]];
}

export function roleHasPermission(role: AdminRole, permission: AdminPermission): boolean {
  return adminPermissions[role].includes(permission);
}
