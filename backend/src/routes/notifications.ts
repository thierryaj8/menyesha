import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { prisma } from '../db.js';
import { HttpError } from '../errors.js';

export const notificationsRouter = Router();

function toClientNotification(notification: {
  id: string;
  kind: string;
  title: string;
  body: string;
  route: string | null;
  isUrgent: boolean;
  readAt: Date | null;
  createdAt: Date;
}) {
  return {
    id: notification.id,
    kind: notification.kind,
    title: notification.title,
    body: notification.body,
    route: notification.route ?? undefined,
    isUrgent: notification.isUrgent,
    isRead: notification.readAt !== null,
    createdAt: notification.createdAt.toISOString(),
  };
}

notificationsRouter.use(authenticate);

notificationsRouter.get('/', async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.authUserId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  res.json({ notifications: notifications.map(toClientNotification) });
});

notificationsRouter.patch('/read-all', async (req, res) => {
  const result = await prisma.notification.updateMany({
    where: { userId: req.authUserId, readAt: null },
    data: { readAt: new Date() },
  });
  res.json({ updated: result.count });
});

notificationsRouter.patch('/:id/read', async (req, res) => {
  const notification = await prisma.notification.findFirst({
    where: { id: req.params.id, userId: req.authUserId },
  });
  if (!notification) throw new HttpError(404, 'Notification not found');

  const updated = await prisma.notification.update({
    where: { id: notification.id },
    data: { readAt: notification.readAt ?? new Date() },
  });
  res.json({ notification: toClientNotification(updated) });
});