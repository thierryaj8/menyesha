import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/db.js';

async function main() {
  const username = process.env.CMS_BOOTSTRAP_USERNAME?.trim().toLowerCase();
  const email = process.env.CMS_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const password = process.env.CMS_BOOTSTRAP_PASSWORD;

  if (!username || !email || !password) {
    throw new Error('Set CMS_BOOTSTRAP_USERNAME, CMS_BOOTSTRAP_EMAIL, and CMS_BOOTSTRAP_PASSWORD to create the first admin');
  }
  if (username.length < 3 || password.length < 12 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Use a username of at least 3 characters, a valid email, and a password of at least 12 characters');
  }

  const existingAdmins = await prisma.adminAccount.count();
  const departmentWithUsername = await prisma.policeDepartment.findUnique({ where: { username } });
  if (existingAdmins > 0 || departmentWithUsername) {
    throw new Error('Initial admin creation requires no existing admin accounts and an unused staff username');
  }

  await prisma.adminAccount.create({
    data: {
      username,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: 'super_admin',
      isActive: true,
    },
  });
  console.info(`Created initial super admin account "${username}". Remove the bootstrap variables after use.`);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Unable to create initial admin account');
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
