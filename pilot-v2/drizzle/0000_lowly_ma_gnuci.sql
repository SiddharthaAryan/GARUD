CREATE TABLE `pilot_attempts` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`since` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pilot_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`ward_id` integer NOT NULL,
	`action` text NOT NULL,
	`at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pilot_sessions` (
	`hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pilot_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pilot_users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`password_hash` text NOT NULL,
	`salt` text NOT NULL,
	`ward_id` integer,
	`since` integer,
	`version` integer DEFAULT 0 NOT NULL,
	`last_event_id` text,
	`active` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pilot_users_username_unique` ON `pilot_users` (`username`);--> statement-breakpoint
CREATE TABLE `pilot_wards` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`floor` text NOT NULL,
	`created_at` integer NOT NULL,
	`qr_generated_at` integer,
	`qr_version` integer DEFAULT 0 NOT NULL
);
