/*
  Warnings:

  - You are about to drop the `denylist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ignore_hosts` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ExcludedHostSource" AS ENUM ('joinmisskey', 'manual', 'system');

-- CreateTable
CREATE TABLE "excluded_hosts" (
    "domain" STRING NOT NULL,
    "reason" STRING,
    "source" "ExcludedHostSource" NOT NULL DEFAULT 'system',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "excluded_hosts_pkey" PRIMARY KEY ("domain")
);

-- Copy Data from Denylist
INSERT INTO "excluded_hosts" ("domain", "reason", "source", "created_at")
SELECT "domain", "reason", 'system', "created_at"
FROM "denylist";

-- Copy Data from IgnoreHost
-- Note: Casting source enum to text then to new enum works because values overlap
INSERT INTO "excluded_hosts" ("domain", "reason", "source", "created_at")
SELECT "domain", "reason", "source"::text::"ExcludedHostSource", "created_at"
FROM "ignore_hosts"
ON CONFLICT ("domain") DO NOTHING;

-- DropTable
DROP TABLE "denylist";

-- DropTable
DROP TABLE "ignore_hosts";

-- DropEnum
DROP TYPE "IgnoreHostSource";
