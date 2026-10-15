-- Extend department records from login-only accounts into editable CMS profiles.
ALTER TABLE "PoliceDepartment"
    ALTER COLUMN "id" DROP DEFAULT,
    ALTER COLUMN "username" DROP NOT NULL,
    ALTER COLUMN "passwordHash" DROP NOT NULL,
    ADD COLUMN "description" TEXT NOT NULL DEFAULT '',
    ADD COLUMN "location" TEXT NOT NULL DEFAULT '',
    ADD COLUMN "logoUri" TEXT,
    ADD COLUMN "coverUri" TEXT,
    ADD COLUMN "contactPhone" TEXT,
    ADD COLUMN "contactEmail" TEXT,
    ADD COLUMN "website" TEXT,
    ADD COLUMN "socialLinks" JSONB,
    ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "AdminAccount" ADD COLUMN "lastLoginAt" TIMESTAMP(3);

CREATE TYPE "CmsResource" AS ENUM (
    'announcement',
    'traffic_doc',
    'article',
    'newsletter',
    'discover_post',
    'discover_video',
    'discover_photo',
    'advertisement',
    'web_banner',
    'campaign'
);

CREATE TYPE "AdminActivityArea" AS ENUM ('content', 'police', 'traffic', 'advertising', 'system');
CREATE TYPE "AdminActivityAction" AS ENUM ('created', 'updated', 'published', 'unpublished', 'archived', 'verified', 'suspended', 'scheduled');

CREATE TABLE "CmsRecord" (
    "id" TEXT NOT NULL,
    "resource" "CmsResource" NOT NULL,
    "content" JSONB NOT NULL,
    "departmentId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CmsRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CmsRecord_resource_createdAt_idx" ON "CmsRecord"("resource", "createdAt");
CREATE INDEX "CmsRecord_departmentId_resource_idx" ON "CmsRecord"("departmentId", "resource");

CREATE TABLE "AdminActivityLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "actor" TEXT NOT NULL,
    "action" "AdminActivityAction" NOT NULL,
    "description" TEXT NOT NULL,
    "area" "AdminActivityArea" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminActivityLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AdminActivityLog_createdAt_idx" ON "AdminActivityLog"("createdAt");
