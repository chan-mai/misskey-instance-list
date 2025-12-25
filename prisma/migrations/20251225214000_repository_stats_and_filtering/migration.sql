-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "SuspensionState" AS ENUM ('none', 'suspended', 'gone');

-- CreateTable
CREATE TABLE "instances" (
    "id" STRING NOT NULL,
    "node_name" STRING,
    "users_count" INT4 DEFAULT 0,
    "notes_count" INT4 DEFAULT 0,
    "version" STRING,
    "is_alive" BOOL NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated" TIMESTAMP(3),
    "last_check_at" TIMESTAMP(3),
    "banner_url" STRING,
    "icon_url" STRING,
    "suspension_state" "SuspensionState" NOT NULL DEFAULT 'none',
    "recommendation_score" FLOAT8,
    "repository_url" STRING,

    CONSTRAINT "instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repositories" (
    "url" STRING NOT NULL,
    "name" STRING,
    "description" STRING,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "repositories_pkey" PRIMARY KEY ("url")
);

-- CreateTable
CREATE TABLE "denylist" (
    "domain" STRING NOT NULL,
    "reason" STRING,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "denylist_pkey" PRIMARY KEY ("domain")
);

-- CreateTable
CREATE TABLE "ignore_hosts" (
    "domain" STRING NOT NULL,
    "reason" STRING,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ignore_hosts_pkey" PRIMARY KEY ("domain")
);

-- CreateIndex
CREATE INDEX "instances_repository_url_idx" ON "instances"("repository_url");

-- AddForeignKey
ALTER TABLE "instances" ADD CONSTRAINT "instances_repository_url_fkey" FOREIGN KEY ("repository_url") REFERENCES "repositories"("url") ON DELETE SET NULL ON UPDATE CASCADE;

