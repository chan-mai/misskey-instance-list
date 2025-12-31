-- CreateEnum
CREATE TYPE "IgnoreHostSource" AS ENUM ('joinmisskey', 'manual');

-- AlterTable
ALTER TABLE "ignore_hosts" ADD COLUMN     "source" "IgnoreHostSource" NOT NULL DEFAULT 'joinmisskey';
