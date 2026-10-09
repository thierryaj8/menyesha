import { Prisma, type Report as DbReport, type ReportStatus } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate.js';
import { prisma } from '../db.js';
import { HttpError } from '../errors.js';
import {
  categories,
  dailyReportLimit,
  distanceMeters,
  duplicateRadiusMeters,
  duplicateWindowDays,
  startOfKigaliDay,
  startOfKigaliWeek,
} from '../domain/reports.js';

export const reportsRouter = Router();

const createSchema = z.object({
  categoryId: z.enum(categories),
  description: z.string().trim().min(1).max(2000),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  area: z.string().trim().min(1).max(120),
  incidentAt: z.string().datetime().optional(),
  photoUrl: z.string().url().optional(),
  isAnonymous: z.boolean().default(false),
});

type ReportWithTimeline = DbReport & { timeline: { status: ReportStatus; createdAt: Date }[] };

function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) throw new HttpError(400, result.error.issues[0]?.message ?? 'Invalid request');
  return result.data;
}

function toClientReport(report: ReportWithTimeline) {
  return {
    id: report.id,
    authorId: report.authorId,
    categoryId: report.categoryId,
    description: report.description,
    photoUri: report.photoUrl,
    location: {
      latitude: Number(report.latitude.toFixed(2)),
      longitude: Number(report.longitude.toFixed(2)),
    },
    area: report.area,
    status: report.status,
    createdAt: report.createdAt.toISOString(),
    timeline: report.timeline.map((entry) => ({ status: entry.status, date: entry.createdAt.toISOString() })),
    duplicateOfId: report.duplicateOfId,
    linkedCount: report.linkedCount,
    pointsEligible: report.pointsEligible,
  };
}

reportsRouter.use(authenticate);

reportsRouter.post('/', async (req, res) => {
  const input = parse(createSchema, req.body);
  const userId = req.authUserId!;
  const now = new Date();
  const dayStart = startOfKigaliDay(now);
  const report = await prisma.$transaction(async (transaction) => {
    const dailyCount = await transaction.report.count({
      where: { authorId: userId, createdAt: { gte: dayStart } },
    });
    if (dailyCount >= dailyReportLimit) throw new HttpError(429, 'Daily report limit reached');

    const windowStart = new Date(now.getTime() - duplicateWindowDays * 24 * 60 * 60 * 1000);
    const latitudeDelta = duplicateRadiusMeters / 111_000;
    const longitudeScale = Math.max(Math.cos((input.latitude * Math.PI) / 180), 0.01);
    const longitudeDelta = duplicateRadiusMeters / (111_000 * longitudeScale);
    const candidates = await transaction.report.findMany({
      where: {
        categoryId: input.categoryId,
        status: { not: 'action_taken' },
        duplicateOfId: null,
        createdAt: { gte: windowStart },
        latitude: { gte: input.latitude - latitudeDelta, lte: input.latitude + latitudeDelta },
        longitude: { gte: input.longitude - longitudeDelta, lte: input.longitude + longitudeDelta },
      },
      orderBy: { createdAt: 'asc' },
      take: 500,
    });
    const duplicate = candidates.find(
      (candidate) => distanceMeters(input, candidate) <= duplicateRadiusMeters,
    );

    const created = await transaction.report.create({
      data: {
        authorId: userId,
        categoryId: input.categoryId,
        description: input.description,
        photoUrl: input.photoUrl,
        latitude: input.latitude,
        longitude: input.longitude,
        area: input.area,
        incidentAt: input.incidentAt ? new Date(input.incidentAt) : undefined,
        isAnonymous: input.isAnonymous,
        duplicateOfId: duplicate?.id,
        pointsEligible: !duplicate,
        timeline: { create: { status: 'submitted' } },
      },
      include: { timeline: { orderBy: { createdAt: 'asc' } } },
    });

    if (duplicate) {
      await transaction.report.update({
        where: { id: duplicate.id },
        data: { linkedCount: { increment: 1 } },
      });
    }

    await transaction.notification.create({
      data: {
        userId,
        kind: 'report_status',
        title: 'Report submitted',
        body: 'Your report was submitted. We will notify you when its status changes.',
        route: `/report/${created.id}`,
      },
    });

    return created;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

  res.status(201).json({ report: toClientReport(report) });
});

reportsRouter.get('/me/reports', async (req, res) => {
  const reports = await prisma.report.findMany({
    where: { authorId: req.authUserId },
    include: { timeline: { orderBy: { createdAt: 'asc' } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  res.json({ reports: reports.map(toClientReport) });
});

reportsRouter.get('/me/points', async (req, res) => {
  const entries = await prisma.pointEntry.findMany({
    where: { userId: req.authUserId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  res.json({
    points: entries.map((entry) => ({
      id: entry.id,
      reportId: entry.reportId,
      label: entry.label,
      points: entry.points,
      status: entry.status,
      date: entry.createdAt.toISOString(),
    })),
  });
});

reportsRouter.get('/stats/kigali-week', async (_req, res) => {
  const weekStart = startOfKigaliWeek(new Date());
  const [filed, resolved] = await Promise.all([
    prisma.report.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.report.count({ where: { createdAt: { gte: weekStart }, status: 'action_taken' } }),
  ]);
  res.json({ filed, resolved });
});

reportsRouter.get('/:id', async (req, res) => {
  const report = await prisma.report.findFirst({
    where: { id: req.params.id, authorId: req.authUserId },
    include: { timeline: { orderBy: { createdAt: 'asc' } } },
  });
  if (!report) throw new HttpError(404, 'Report not found');
  res.json({ report: toClientReport(report) });
});