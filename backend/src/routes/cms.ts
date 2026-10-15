import { AdminActivityAction, AdminActivityArea, AdminRole, CmsResource, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Router, type Request } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { prisma } from '../db.js';
import { HttpError } from '../errors.js';
import { authenticateStaff } from '../middleware/authenticate-staff.js';
import { permissionsForRole, resourcePermissions, roleHasPermission, type AdminPermission } from '../services/staff-permissions.js';

export const cmsRouter = Router();

const resourceNames = Object.values(CmsResource);
const announcementTypes = ['press_release', 'road_closure', 'public_safety', 'event_notice', 'urgent'] as const;
const trafficCategories = [
  'driving_licences',
  'road_signs',
  'vehicle_regulations',
  'pedestrian_safety',
  'public_transport',
  'traffic_offences',
] as const;
const mediaCategories = [
  'traffic',
  'road_safety',
  'crime_prevention',
  'public_announcements',
  'community_policing',
  'general',
] as const;
const publishStatuses = ['draft', 'review', 'approved', 'published', 'archived'] as const;
const departmentTypes = ['national', 'traffic', 'community', 'regional', 'district', 'specialized'] as const;

const requiredText = z.string().trim().min(1);
const optionalText = z.string().trim().optional();
const optionalUrl = z.string().url().optional();
const isoDate = z.string().datetime();
const commonTags = z.array(z.string().trim()).default([]);

const resourceSchemas: Record<CmsResource, z.ZodTypeAny> = {
  announcement: z.object({
    type: z.enum(announcementTypes),
    headline: requiredText,
    body: requiredText,
    authority: requiredText,
    publishedAt: isoDate,
    locations: z.array(z.string()).default([]),
    mediaUris: z.array(z.string()).optional(),
    sourceUrl: optionalUrl,
    isUrgent: z.boolean().default(false),
  }).passthrough(),
  traffic_doc: z.object({
    title: requiredText,
    category: z.enum(trafficCategories),
    summary: requiredText,
    pdfUrl: optionalUrl,
    issuingAuthority: requiredText,
    sourceUrl: optionalUrl,
    publishedAt: isoDate,
    revisedAt: isoDate.optional(),
    language: z.enum(['en', 'rw', 'fr']),
    version: requiredText,
  }).passthrough(),
  article: z.object({
    title: requiredText,
    summary: requiredText,
    body: requiredText,
    category: z.enum(mediaCategories),
    author: requiredText,
    publishedAt: isoDate.optional(),
    status: z.enum(publishStatuses),
    coverImageUri: optionalUrl,
    mediaUris: z.array(z.string()).optional(),
    documentUrls: z.array(z.string()).optional(),
    tags: commonTags,
  }).passthrough(),
  newsletter: z.object({
    title: requiredText,
    edition: requiredText,
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(2000).max(2200),
    department: requiredText,
    publishedAt: isoDate,
    pdfUrl: optionalUrl,
    articleIds: z.array(z.string()).default([]),
  }).passthrough(),
  discover_post: z.object({
    departmentId: optionalText,
    departmentName: requiredText,
    title: requiredText,
    body: requiredText,
    imageUri: optionalUrl,
    tags: commonTags,
    publishedAt: isoDate,
    views: z.number().int().nonnegative().default(0),
    likes: z.number().int().nonnegative().default(0),
    isVerified: z.boolean().default(false),
  }).passthrough(),
  discover_video: z.object({
    departmentId: optionalText,
    departmentName: requiredText,
    title: requiredText,
    description: requiredText,
    thumbnailUri: optionalUrl,
    videoUri: optionalUrl,
    youtubeUrl: optionalUrl,
    duration: optionalText,
    publishedAt: isoDate,
    views: z.number().int().nonnegative().default(0),
    isVerified: z.boolean().default(false),
  }).passthrough(),
  discover_photo: z.object({
    departmentId: optionalText,
    departmentName: requiredText,
    title: requiredText,
    caption: optionalText,
    imageUri: z.string().url(),
    tags: commonTags,
    publishedAt: isoDate,
    views: z.number().int().nonnegative().default(0),
    isVerified: z.boolean().default(false),
  }).passthrough(),
  advertisement: z.object({
    campaignName: requiredText,
    adType: z.enum(['banner', 'image', 'video', 'campaign']),
    title: requiredText,
    description: requiredText,
    imageUri: optionalUrl,
    videoUri: optionalUrl,
    destinationUrl: optionalUrl,
    startDate: isoDate,
    endDate: isoDate,
    targetPage: z.enum(['home', 'discover', 'traffic', 'news', 'videos', 'departments', 'announcements', 'all']),
    status: z.enum(['draft', 'scheduled', 'active', 'paused', 'ended', 'archived']),
    departmentId: optionalText,
    impressions: z.number().int().nonnegative().default(0),
    clicks: z.number().int().nonnegative().default(0),
    views: z.number().int().nonnegative().default(0),
    shares: z.number().int().nonnegative().default(0),
    createdAt: isoDate.optional(),
    createdBy: optionalText,
  }).passthrough(),
  web_banner: z.object({
    title: requiredText,
    imageUri: optionalUrl,
    bannerText: optionalText,
    ctaLabel: optionalText,
    ctaUrl: optionalUrl,
    location: z.enum(['home', 'discover', 'traffic', 'news', 'videos', 'departments', 'announcements']),
    startDate: isoDate,
    endDate: isoDate,
    status: z.enum(['draft', 'scheduled', 'active', 'inactive', 'archived']),
    createdAt: isoDate.optional(),
    createdBy: optionalText,
  }).passthrough(),
  campaign: z.object({
    title: requiredText,
    description: requiredText,
    imageUri: optionalUrl,
    videoUri: optionalUrl,
    slot: z.enum(['home_banner', 'announcements', 'traffic', 'general']),
    topic: requiredText,
    startsAt: isoDate,
    endsAt: isoDate,
    cta: z.object({ label: requiredText, url: z.string().url() }).optional(),
    views: z.number().int().nonnegative().default(0),
    clicks: z.number().int().nonnegative().default(0),
    isActive: z.boolean().default(false),
  }).passthrough(),
};

type StaffContext = {
  id: string;
  username: string;
  type: 'admin' | 'department';
  role: AdminRole | null;
  departmentId: string | null;
  isActive: boolean;
};

const departmentSchema = z.object({
  name: requiredText.max(160),
  shortName: requiredText.max(80),
  type: z.enum(departmentTypes),
  description: z.string().trim().max(3000).default(''),
  location: z.string().trim().max(200).default(''),
  logoUri: optionalUrl,
  coverUri: optionalUrl,
  contactPhone: optionalText,
  contactEmail: z.string().email().optional(),
  website: optionalUrl,
  socialLinks: z.record(z.string(), z.string().url()).optional(),
  isVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
  username: z.string().trim().min(3).max(100).optional(),
  password: z.string().min(8).max(128).optional(),
}).passthrough();

const updateDepartmentSchema = departmentSchema.partial().refine(
  (value) => Boolean(value.username) === Boolean(value.password) || value.password === undefined,
  'A password is required when setting a department username',
);

const accountCreateSchema = z.object({
  username: z.string().trim().min(3).max(100),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
  role: z.enum(['super_admin', 'content_admin', 'police_admin', 'traffic_admin', 'advertising_admin']),
  departmentId: optionalText,
  isActive: z.boolean().default(true),
});

const accountUpdateSchema = z.object({
  username: z.string().trim().min(3).max(100).optional(),
  email: z.string().trim().email().max(254).optional(),
  password: z.string().min(8).max(128).optional(),
  role: z.enum(['super_admin', 'content_admin', 'police_admin', 'traffic_admin', 'advertising_admin']).optional(),
  departmentId: z.union([requiredText, z.null()]).optional(),
  isActive: z.boolean().optional(),
});

async function ensureStaffUsernameAvailable(
  username: string,
  exceptAdminId?: string,
  exceptDepartmentId?: string,
) {
  const normalized = username.toLowerCase();
  const [admin, department] = await Promise.all([
    prisma.adminAccount.findUnique({ where: { username: normalized }, select: { id: true } }),
    prisma.policeDepartment.findUnique({ where: { username: normalized }, select: { id: true } }),
  ]);
  if ((admin && admin.id !== exceptAdminId) || (department && department.id !== exceptDepartmentId)) {
    throw new HttpError(409, 'Username is already in use');
  }
}

function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new HttpError(400, result.error.issues[0]?.message ?? 'Invalid request');
  }
  return result.data;
}

async function currentStaff(req: Request): Promise<StaffContext> {
  if (!req.authStaffId || !req.authStaffType) throw new HttpError(401, 'Authentication required');

  const account = req.authStaffType === 'admin'
    ? await prisma.adminAccount.findUnique({ where: { id: req.authStaffId } })
    : await prisma.policeDepartment.findUnique({ where: { id: req.authStaffId } });
  if (!account || !account.isActive) throw new HttpError(401, 'Invalid or expired access token');

  if (req.authStaffType === 'admin') {
    const admin = account as Extract<NonNullable<typeof account>, { role: AdminRole }>;
    return {
      id: admin.id,
      username: admin.username,
      type: 'admin',
      role: admin.role,
      departmentId: admin.departmentId,
      isActive: admin.isActive,
    };
  }
  const department = account as Extract<NonNullable<typeof account>, { shortName: string }>;
  return {
    id: department.id,
    username: department.username ?? department.shortName,
    type: 'department',
    role: null,
    departmentId: department.id,
    isActive: department.isActive,
  };
}

function hasPermission(staff: StaffContext, permission: AdminPermission): boolean {
  if (staff.type === 'department') return permission === 'manage_announcements';
  return staff.role !== null && roleHasPermission(staff.role, permission);
}

async function requirePermission(req: Request, permission: AdminPermission): Promise<StaffContext> {
  const staff = await currentStaff(req);
  if (!hasPermission(staff, permission)) throw new HttpError(403, 'You do not have permission to perform this action');
  return staff;
}

function departmentWhere(staff: StaffContext): { departmentId?: string } {
  return staff.departmentId ? { departmentId: staff.departmentId } : {};
}

function clientDepartment(department: {
  id: string; name: string; shortName: string; type: string; description: string; location: string; username: string | null;
  logoUri: string | null; coverUri: string | null; contactPhone: string | null; contactEmail: string | null;
  website: string | null; socialLinks: Prisma.JsonValue | null; isVerified: boolean; isActive: boolean; createdAt: Date;
}, counts = { postCount: 0, videoCount: 0, photoCount: 0, announcementCount: 0 }) {
  return {
    id: department.id,
    name: department.name,
    shortName: department.shortName,
    type: department.type,
    isVerified: department.isVerified,
    isActive: department.isActive,
    description: department.description,
    location: department.location,
    username: department.username ?? undefined,
    createdAt: department.createdAt.toISOString(),
    logoUri: department.logoUri ?? undefined,
    coverUri: department.coverUri ?? undefined,
    contactPhone: department.contactPhone ?? undefined,
    contactEmail: department.contactEmail ?? undefined,
    website: department.website ?? undefined,
    socialLinks: department.socialLinks ?? undefined,
    ...counts,
  };
}

async function clientDepartments(
  departments: Awaited<ReturnType<typeof prisma.policeDepartment.findMany>>,
) {
  if (departments.length === 0) return [];
  const grouped = await prisma.cmsRecord.groupBy({
    by: ['departmentId', 'resource'],
    where: {
      departmentId: { in: departments.map((department) => department.id) },
      resource: { in: ['announcement', 'discover_post', 'discover_video', 'discover_photo'] },
    },
    _count: { _all: true },
  });
  return departments.map((department) => {
    const countFor = (resource: CmsResource) =>
      grouped.find((entry) => entry.departmentId === department.id && entry.resource === resource)?._count._all ?? 0;
    return clientDepartment(department, {
      postCount: countFor('discover_post'),
      videoCount: countFor('discover_video'),
      photoCount: countFor('discover_photo'),
      announcementCount: countFor('announcement'),
    });
  });
}

function clientAccount(account: {
  id: string; username: string; email: string; role: AdminRole; departmentId: string | null;
  isActive: boolean; createdAt: Date; lastLoginAt: Date | null;
}) {
  return {
    id: account.id,
    username: account.username,
    email: account.email,
    role: account.role,
    departmentId: account.departmentId ?? undefined,
    isActive: account.isActive,
    createdAt: account.createdAt.toISOString(),
    lastLoginAt: account.lastLoginAt?.toISOString(),
    permissions: permissionsForRole(account.role),
  };
}

function recordContent(record: { id: string; content: Prisma.JsonValue; createdAt: Date; updatedAt: Date }): Record<string, unknown> {
  return {
    ...(record.content as Record<string, unknown>),
    id: record.id,
    createdAt:
      typeof (record.content as Record<string, unknown>).createdAt === 'string'
        ? (record.content as Record<string, unknown>).createdAt
        : record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function areaForResource(resource: CmsResource): AdminActivityArea {
  if (resource === 'announcement' || resource === 'discover_post' || resource === 'discover_video' || resource === 'discover_photo') return 'police';
  if (resource === 'traffic_doc') return 'traffic';
  if (resource === 'advertisement' || resource === 'web_banner' || resource === 'campaign') return 'advertising';
  return 'content';
}

function labelForResource(resource: CmsResource): string {
  return resource.replaceAll('_', ' ');
}

async function recordActivity(
  staff: StaffContext,
  action: AdminActivityAction,
  description: string,
  area: AdminActivityArea,
) {
  await prisma.adminActivityLog.create({
    data: { actorId: staff.id, actor: staff.username, action, description, area },
  });
}

function parseResource(value: string): CmsResource {
  if (!resourceNames.includes(value as CmsResource)) throw new HttpError(404, 'CMS resource not found');
  return value as CmsResource;
}

function routeParam(req: Request, key: string): string {
  const value = req.params[key];
  if (typeof value !== 'string' || !value) throw new HttpError(400, 'Invalid route parameter');
  return value;
}

const metricFields: Partial<Record<CmsResource, readonly string[]>> = {
  campaign: ['views', 'clicks'],
  advertisement: ['impressions', 'clicks', 'views', 'shares'],
  discover_post: ['views', 'likes'],
  discover_video: ['views'],
  discover_photo: ['views'],
  traffic_doc: ['downloads'],
  newsletter: ['downloads'],
};

function isPublicRecord(resource: CmsResource, content: Record<string, unknown>): boolean {
  const now = Date.now();
  const startsAt = (value: unknown) => {
    const timestamp = Date.parse(String(value ?? ''));
    return Number.isFinite(timestamp) && timestamp <= now;
  };
  const endsAt = (value: unknown) => {
    const timestamp = Date.parse(String(value ?? ''));
    return Number.isFinite(timestamp) && timestamp >= now;
  };
  if (resource === 'article') return content.status === 'published';
  if (resource === 'discover_post' || resource === 'discover_video' || resource === 'discover_photo') {
    return content.isVerified === true;
  }
  if (resource === 'advertisement' || resource === 'web_banner') {
    return content.status === 'active' && startsAt(content.startDate) && endsAt(content.endDate);
  }
  if (resource === 'campaign') {
    return content.isActive === true && startsAt(content.startsAt) && endsAt(content.endsAt);
  }
  return true;
}

cmsRouter.get('/public', async (_req, res) => {
  const [records, departments] = await Promise.all([
    prisma.cmsRecord.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.policeDepartment.findMany({
      where: { isActive: true, isVerified: true },
      orderBy: { name: 'asc' },
    }),
  ]);
  const grouped: Partial<Record<CmsResource, ReturnType<typeof recordContent>[]>> = {};

  for (const record of records) {
    const content = recordContent(record);
    if (isPublicRecord(record.resource, content)) {
      grouped[record.resource] = [...(grouped[record.resource] ?? []), content];
    }
  }

  const departmentsWithCounts = await clientDepartments(departments);
  res.json({
    announcements: grouped.announcement ?? [],
    trafficDocs: grouped.traffic_doc ?? [],
    articles: grouped.article ?? [],
    newsletters: grouped.newsletter ?? [],
    discoverPosts: grouped.discover_post ?? [],
    discoverVideos: grouped.discover_video ?? [],
    discoverPhotos: grouped.discover_photo ?? [],
    advertisements: grouped.advertisement ?? [],
    webBanners: grouped.web_banner ?? [],
    campaigns: grouped.campaign ?? [],
    departments: departmentsWithCounts.map(({ username: _username, ...department }) => department),
  });
});

cmsRouter.post('/metrics/:resource/:id', rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
}), async (req, res) => {
  const resource = parseResource(routeParam(req, 'resource'));
  const metricResult = z.string().safeParse(req.body?.metric);
  if (!metricResult.success) throw new HttpError(400, 'Unsupported CMS metric');
  const metric = metricResult.data;
  if (!metricFields[resource]?.includes(metric)) throw new HttpError(400, 'Unsupported CMS metric');
  const existing = await prisma.cmsRecord.findFirst({ where: { id: routeParam(req, 'id'), resource } });
  if (!existing || !isPublicRecord(resource, existing.content as Record<string, unknown>)) {
    throw new HttpError(404, 'Public CMS record not found');
  }
  const affected = await prisma.$executeRaw`
    UPDATE "CmsRecord"
    SET "content" = jsonb_set(
      "content",
      ARRAY[${metric}],
      to_jsonb(COALESCE(NULLIF("content"->>${metric}, '')::INTEGER, 0) + 1),
      true
    ),
    "updatedAt" = NOW()
    WHERE "id" = ${existing.id} AND "resource" = ${resource}::"CmsResource"
  `;
  if (affected !== 1) throw new HttpError(404, 'Public CMS record not found');
  const updated = await prisma.cmsRecord.findUniqueOrThrow({ where: { id: existing.id } });
  res.json({ record: recordContent(updated) });
});

cmsRouter.use(authenticateStaff);

cmsRouter.get('/dashboard', async (req, res) => {
  const staff = await requirePermission(req, 'view_analytics');
  const where = departmentWhere(staff);
  const [records, departments, accounts, activity] = await Promise.all([
    prisma.cmsRecord.findMany({ where, select: { resource: true, content: true } }),
    prisma.policeDepartment.count({ where: staff.departmentId ? { id: staff.departmentId } : undefined }),
    prisma.adminAccount.count({ where: staff.departmentId ? { departmentId: staff.departmentId } : undefined }),
    prisma.adminActivityLog.findMany({
      where: staff.departmentId ? { actorId: staff.id } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  const counts: Partial<Record<CmsResource, number>> = {};
  let views = 0;
  let downloads = 0;
  for (const record of records) {
    counts[record.resource] = (counts[record.resource] ?? 0) + 1;
    const data = record.content as Record<string, unknown>;
    views += Number(data.views ?? 0);
    downloads += Number(data.downloads ?? 0);
  }
  res.json({
    counts: {
      ...counts,
      departments,
      accounts,
      publishedArticles: records.filter((record) =>
        record.resource === 'article' && (record.content as Record<string, unknown>).status === 'published',
      ).length,
    },
    engagement: { views, downloads },
    activity: activity.map((entry) => ({
      id: entry.id,
      action: entry.action,
      description: entry.description,
      actor: entry.actor,
      area: entry.area,
      at: entry.createdAt.toISOString(),
    })),
  });
});

cmsRouter.get('/accounts', async (req, res) => {
  const staff = await requirePermission(req, 'manage_accounts');
  const accounts = await prisma.adminAccount.findMany({
    where: staff.departmentId ? { departmentId: staff.departmentId } : undefined,
    orderBy: { createdAt: 'desc' },
  });
  res.json({ accounts: accounts.map(clientAccount) });
});

cmsRouter.post('/accounts', async (req, res) => {
  const staff = await requirePermission(req, 'manage_accounts');
  const input = parse(accountCreateSchema, req.body);
  await ensureStaffUsernameAvailable(input.username);
  if (input.role === 'super_admin' && !hasPermission(staff, 'manage_roles')) {
    throw new HttpError(403, 'Only a super admin can create another super admin');
  }
  if (input.role !== 'super_admin' && input.departmentId && staff.departmentId && input.departmentId !== staff.departmentId) {
    throw new HttpError(403, 'You cannot assign an account to another department');
  }
  if (staff.departmentId && input.departmentId && input.departmentId !== staff.departmentId) {
    throw new HttpError(403, 'You cannot assign an account to another department');
  }
  if (input.departmentId && !await prisma.policeDepartment.findUnique({ where: { id: input.departmentId }, select: { id: true } })) {
    throw new HttpError(400, 'Department not found');
  }
  const account = await prisma.adminAccount.create({
    data: {
      username: input.username.toLowerCase(),
      email: input.email.toLowerCase(),
      passwordHash: await bcrypt.hash(input.password, 12),
      role: input.role,
      departmentId: staff.departmentId ?? input.departmentId,
      isActive: input.isActive,
    },
  });
  await recordActivity(staff, 'created', `Created ${input.role.replaceAll('_', ' ')} account ${account.username}`, 'system');
  res.status(201).json({ account: clientAccount(account) });
});

cmsRouter.patch('/accounts/:id', async (req, res) => {
  const staff = await requirePermission(req, 'manage_accounts');
  const existing = await prisma.adminAccount.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new HttpError(404, 'Admin account not found');
  if (staff.departmentId && existing.departmentId !== staff.departmentId) throw new HttpError(404, 'Admin account not found');

  const input = parse(accountUpdateSchema, req.body);
  if (input.username) await ensureStaffUsernameAvailable(input.username, existing.id);
  if ((input.role === 'super_admin' || existing.role === 'super_admin') && !hasPermission(staff, 'manage_roles')) {
    throw new HttpError(403, 'Only a super admin can change super admin accounts');
  }
  if (input.departmentId !== undefined && staff.departmentId && input.departmentId !== staff.departmentId) {
    throw new HttpError(403, 'You cannot assign an account to another department');
  }
  if (input.departmentId && !await prisma.policeDepartment.findUnique({ where: { id: input.departmentId }, select: { id: true } })) {
    throw new HttpError(400, 'Department not found');
  }
  if (existing.id === staff.id && input.isActive === false) throw new HttpError(400, 'You cannot deactivate your own account');

  const account = await prisma.adminAccount.update({
    where: { id: existing.id },
    data: {
      ...(input.username ? { username: input.username.toLowerCase() } : {}),
      ...(input.email ? { email: input.email.toLowerCase() } : {}),
      ...(input.password ? { passwordHash: await bcrypt.hash(input.password, 12) } : {}),
      ...(input.role ? { role: input.role } : {}),
      ...(input.departmentId !== undefined ? { departmentId: input.departmentId } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });
  await recordActivity(staff, 'updated', `Updated admin account ${account.username}`, 'system');
  res.json({ account: clientAccount(account) });
});

cmsRouter.delete('/accounts/:id', async (req, res) => {
  const staff = await requirePermission(req, 'manage_accounts');
  const account = await prisma.adminAccount.findUnique({ where: { id: req.params.id } });
  if (!account) throw new HttpError(404, 'Admin account not found');
  if (staff.departmentId && account.departmentId !== staff.departmentId) throw new HttpError(404, 'Admin account not found');
  if (account.id === staff.id) throw new HttpError(400, 'You cannot delete your own account');
  if (account.role === 'super_admin' && !hasPermission(staff, 'manage_roles')) {
    throw new HttpError(403, 'Only a super admin can delete super admin accounts');
  }
  if (account.role === 'super_admin') {
    const otherSuperAdmins = await prisma.adminAccount.count({
      where: { role: 'super_admin', isActive: true, id: { not: account.id } },
    });
    if (otherSuperAdmins === 0) throw new HttpError(400, 'The last active super admin cannot be deleted');
  }
  await prisma.adminAccount.delete({ where: { id: account.id } });
  await recordActivity(staff, 'suspended', `Deleted admin account ${account.username}`, 'system');
  res.status(204).end();
});

cmsRouter.get('/departments', async (req, res) => {
  const staff = await requirePermission(req, 'manage_departments');
  const departments = await prisma.policeDepartment.findMany({
    where: staff.departmentId ? { id: staff.departmentId } : undefined,
    orderBy: { name: 'asc' },
  });
  res.json({ departments: await clientDepartments(departments) });
});

cmsRouter.post('/departments', async (req, res) => {
  const staff = await requirePermission(req, 'manage_departments');
  const input = parse(departmentSchema, req.body);
  if (staff.departmentId) throw new HttpError(403, 'Department accounts cannot create departments');
  if (Boolean(input.username) !== Boolean(input.password)) {
    throw new HttpError(400, 'A username and password must be provided together');
  }
  if (input.username) await ensureStaffUsernameAvailable(input.username);
  const department = await prisma.policeDepartment.create({
    data: {
      name: input.name,
      shortName: input.shortName,
      type: input.type,
      description: input.description,
      location: input.location,
      logoUri: input.logoUri,
      coverUri: input.coverUri,
      contactPhone: input.contactPhone,
      contactEmail: input.contactEmail,
      website: input.website,
      socialLinks: input.socialLinks,
      isVerified: input.isVerified,
      isActive: input.isActive,
      username: input.username?.toLowerCase(),
      passwordHash: input.password ? await bcrypt.hash(input.password, 12) : undefined,
    },
  });
  await recordActivity(staff, 'created', `Created police department ${department.name}`, 'police');
  res.status(201).json({ department: clientDepartment(department) });
});

cmsRouter.patch('/departments/:id', async (req, res) => {
  const staff = await requirePermission(req, 'manage_departments');
  if (staff.departmentId && req.params.id !== staff.departmentId) throw new HttpError(404, 'Department not found');
  const existing = await prisma.policeDepartment.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new HttpError(404, 'Department not found');
  const input = parse(updateDepartmentSchema, req.body);
  if (input.username) await ensureStaffUsernameAvailable(input.username, undefined, existing.id);
  if (input.username && input.username.toLowerCase() !== existing.username && !input.password) {
    throw new HttpError(400, 'A password is required when changing the department username');
  }
  const department = await prisma.policeDepartment.update({
    where: { id: existing.id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.shortName !== undefined ? { shortName: input.shortName } : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.location !== undefined ? { location: input.location } : {}),
      ...(input.logoUri !== undefined ? { logoUri: input.logoUri } : {}),
      ...(input.coverUri !== undefined ? { coverUri: input.coverUri } : {}),
      ...(input.contactPhone !== undefined ? { contactPhone: input.contactPhone } : {}),
      ...(input.contactEmail !== undefined ? { contactEmail: input.contactEmail } : {}),
      ...(input.website !== undefined ? { website: input.website } : {}),
      ...(input.socialLinks !== undefined ? { socialLinks: input.socialLinks } : {}),
      ...(input.isVerified !== undefined ? { isVerified: input.isVerified } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.username ? { username: input.username.toLowerCase() } : {}),
      ...(input.password ? { passwordHash: await bcrypt.hash(input.password, 12) } : {}),
    },
  });
  await recordActivity(staff, 'updated', `Updated police department ${department.name}`, 'police');
  res.json({ department: clientDepartment(department) });
});

cmsRouter.delete('/departments/:id', async (req, res) => {
  const staff = await requirePermission(req, 'manage_departments');
  if (staff.departmentId) throw new HttpError(403, 'Department accounts cannot delete departments');
  const department = await prisma.policeDepartment.findUnique({ where: { id: req.params.id } });
  if (!department) throw new HttpError(404, 'Department not found');
  await prisma.policeDepartment.delete({ where: { id: department.id } });
  await recordActivity(staff, 'suspended', `Deleted police department ${department.name}`, 'police');
  res.status(204).end();
});

cmsRouter.get('/:resource', async (req, res) => {
  const resource = parseResource(req.params.resource);
  const staff = await requirePermission(req, resourcePermissions[resource]);
  const records = await prisma.cmsRecord.findMany({
    where: { resource, ...departmentWhere(staff) },
    orderBy: { createdAt: 'desc' },
    take: 500,
  });
  res.json({ records: records.map(recordContent) });
});

cmsRouter.post('/:resource', async (req, res) => {
  const resource = parseResource(req.params.resource);
  const staff = await requirePermission(req, resourcePermissions[resource]);
  const input = parse(resourceSchemas[resource], req.body) as Record<string, unknown>;
  delete input.id;
  const departmentId = staff.departmentId ?? (typeof input.departmentId === 'string' ? input.departmentId : null);
  if (!departmentId && typeof input.departmentName === 'string') {
    const department = await prisma.policeDepartment.findFirst({
      where: { OR: [{ name: input.departmentName.trim() }, { shortName: input.departmentName.trim() }] },
      select: { id: true, name: true },
    });
    if (department) {
      input.departmentId = department.id;
      input.departmentName = department.name;
    }
  }
  const resolvedDepartmentId = staff.departmentId ?? (typeof input.departmentId === 'string' ? input.departmentId : null);
  if (resolvedDepartmentId && !await prisma.policeDepartment.findUnique({ where: { id: resolvedDepartmentId }, select: { id: true } })) {
    throw new HttpError(400, 'Department not found');
  }
  if (resource === 'advertisement' || resource === 'web_banner') {
    input.createdAt ??= new Date().toISOString();
    input.createdBy ??= staff.username;
  }
  const record = await prisma.cmsRecord.create({
    data: {
      resource,
      content: input as Prisma.InputJsonValue,
      departmentId: resolvedDepartmentId,
      createdById: staff.id,
    },
  });
  await recordActivity(staff, 'created', `Created ${labelForResource(resource)} ${String(input.title ?? input.headline ?? input.campaignName ?? '')}`.trim(), areaForResource(resource));
  res.status(201).json({ record: recordContent(record) });
});

cmsRouter.patch('/:resource/:id', async (req, res) => {
  const resource = parseResource(req.params.resource);
  const staff = await requirePermission(req, resourcePermissions[resource]);
  const existing = await prisma.cmsRecord.findFirst({
    where: { id: routeParam(req, 'id'), resource, ...departmentWhere(staff) },
  });
  if (!existing) throw new HttpError(404, 'CMS record not found');

  const patch = req.body;
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
    throw new HttpError(400, 'Invalid request body');
  }
  const merged = { ...(existing.content as Record<string, unknown>), ...patch };
  delete merged.id;
  delete merged.createdAt;
  const input = parse(resourceSchemas[resource], merged) as Record<string, unknown>;
  const departmentId = staff.departmentId ?? (typeof input.departmentId === 'string' ? input.departmentId : existing.departmentId);
  if (departmentId && !await prisma.policeDepartment.findUnique({ where: { id: departmentId }, select: { id: true } })) {
    throw new HttpError(400, 'Department not found');
  }
  const record = await prisma.cmsRecord.update({
    where: { id: existing.id },
    data: { content: input as Prisma.InputJsonValue, departmentId },
  });
  await recordActivity(staff, 'updated', `Updated ${labelForResource(resource)} ${String(input.title ?? input.headline ?? input.campaignName ?? '')}`.trim(), areaForResource(resource));
  res.json({ record: recordContent(record) });
});

cmsRouter.delete('/:resource/:id', async (req, res) => {
  const resource = parseResource(req.params.resource);
  const staff = await requirePermission(req, resourcePermissions[resource]);
  const record = await prisma.cmsRecord.findFirst({
    where: { id: routeParam(req, 'id'), resource, ...departmentWhere(staff) },
  });
  if (!record) throw new HttpError(404, 'CMS record not found');
  const content = record.content as Record<string, unknown>;
  await prisma.cmsRecord.delete({ where: { id: record.id } });
  await recordActivity(
    staff,
    'archived',
    `Deleted ${labelForResource(resource)} ${String(content.title ?? content.headline ?? content.campaignName ?? '')}`.trim(),
    areaForResource(resource),
  );
  res.status(204).end();
});
