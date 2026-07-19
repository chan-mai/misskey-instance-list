CREATE TABLE `excluded_hosts` (
	`domain` text PRIMARY KEY NOT NULL,
	`reason` text,
	`source` text DEFAULT 'system' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	CONSTRAINT "excluded_hosts_source_check" CHECK("excluded_hosts"."source" in ('joinmisskey', 'manual', 'system'))
);
--> statement-breakpoint
CREATE TABLE `instances` (
	`id` text PRIMARY KEY NOT NULL,
	`node_name` text,
	`users_count` integer DEFAULT 0,
	`notes_count` integer DEFAULT 0,
	`version` text,
	`is_alive` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`last_updated` integer DEFAULT (unixepoch() * 1000),
	`last_check_at` integer,
	`banner_url` text,
	`icon_url` text,
	`suspension_state` text DEFAULT 'none' NOT NULL,
	`recommendation_score` real,
	`open_registrations` integer,
	`email_required` integer,
	`repository_url` text,
	`language` text,
	FOREIGN KEY (`repository_url`) REFERENCES `repositories`(`url`) ON UPDATE cascade ON DELETE set null,
	CONSTRAINT "instances_suspension_state_check" CHECK("instances"."suspension_state" in ('none', 'suspended', 'gone'))
);
--> statement-breakpoint
CREATE INDEX `instances_repository_url_idx` ON `instances` (`repository_url`);--> statement-breakpoint
CREATE INDEX `instances_language_idx` ON `instances` (`language`);--> statement-breakpoint
CREATE TABLE `repositories` (
	`url` text PRIMARY KEY NOT NULL,
	`name` text,
	`description` text,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
