import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Prisma } from '@prisma/client';
import { isAllowedWebOrigin } from './config.js';
import { prisma } from './db.js';
import { HttpError } from './errors.js';
import { authRouter } from './routes/auth.js';
import { notificationsRouter } from './routes/notifications.js';
import { reportsRouter } from './routes/reports.js';
import { cmsRouter } from './routes/cms.js';

export const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => callback(null, isAllowedWebOrigin(origin)),
}));
app.use(express.json({ limit: '64kb' }));

app.get('/health', async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: 'ok' });
});

app.use('/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
}), authRouter);
app.use('/reports', reportsRouter);
app.use('/notifications', notificationsRouter);
app.use('/cms', cmsRouter);

const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    res.status(409).json({ error: 'A record with that unique value already exists' });
    return;
  }

  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
};

app.use(errorHandler);