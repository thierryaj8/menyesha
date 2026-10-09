import { app } from './app.js';
import { env } from './config.js';
import { prisma } from './db.js';

const server = app.listen(env.PORT, () => {
  console.info(`Menyesha API listening on port ${env.PORT}`);
});

async function shutdown(): Promise<void> {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());