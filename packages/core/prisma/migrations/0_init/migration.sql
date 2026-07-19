-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."SuspensionState" AS ENUM ('none', 'suspended', 'gone');

-- CreateTable
CREATE TABLE "public"."denylist" (
    "domain" STRING NOT NULL,
    "reason" STRING,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "denylist_pkey" PRIMARY KEY ("domain")
);

-- CreateTable
CREATE TABLE "public"."ignore_hosts" (
    "domain" STRING NOT NULL,
    "reason" STRING,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ignore_hosts_pkey" PRIMARY KEY ("domain")
);

-- CreateTable
CREATE TABLE "public"."instances" (
    "id" STRING NOT NULL,
    "node_name" STRING,
    "users_count" INT4 DEFAULT 0,
    "notes_count" INT4 DEFAULT 0,
    "version" STRING,
    "is_alive" BOOL NOT NULL DEFAULT false,
    "last_updated" TIMESTAMP(3),
    "last_check_at" TIMESTAMP(3),
    "banner_url" STRING,
    "icon_url" STRING,
    "suspension_state" "public"."SuspensionState" NOT NULL DEFAULT 'none',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recommendation_score" FLOAT8,

    CONSTRAINT "instances_pkey" PRIMARY KEY ("id")
);

