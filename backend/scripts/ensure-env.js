import { constants, copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const backendDir = dirname(dirname(fileURLToPath(import.meta.url)));
const envPath = join(backendDir, '.env');
const examplePath = join(backendDir, '.env.example');

if (existsSync(envPath)) process.exit(0);

if (process.env.NODE_ENV === 'production') {
  console.error('Missing backend/.env. Set DATABASE_URL and JWT_SECRET in the production environment.');
  process.exit(1);
}

if (!existsSync(examplePath)) {
  console.error('Missing backend/.env.example. Restore the example configuration before starting the API.');
  process.exit(1);
}

copyFileSync(examplePath, envPath, constants.COPYFILE_EXCL);
console.info('Created backend/.env from .env.example for local development.');
