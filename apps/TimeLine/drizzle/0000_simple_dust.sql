CREATE TABLE `device_assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text NOT NULL,
	`device_name` text NOT NULL,
	`user_id` text,
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`floor` integer NOT NULL,
	`type` text NOT NULL,
	`capacity` integer NOT NULL,
	`imac_count` integer DEFAULT 25 NOT NULL,
	`is_active` integer DEFAULT 1 NOT NULL,
	`notes` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rooms_name_unique` ON `rooms` (`name`);--> statement-breakpoint
CREATE TABLE `schedule_blocks` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`color` text,
	`organizer` text,
	`start_hour` integer NOT NULL,
	`end_hour` integer NOT NULL,
	`start_minute` integer,
	`end_minute` integer,
	`recurrence` text DEFAULT 'one_time' NOT NULL,
	`specific_date` text,
	`days_of_week` text,
	`valid_from` text NOT NULL,
	`valid_until` text,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_by` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `schedule_overrides` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text NOT NULL,
	`date` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`instructor` text,
	`notes` text,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `schedules` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text NOT NULL,
	`title` text NOT NULL,
	`type` text NOT NULL,
	`days_of_week` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`instructor` text,
	`notes` text,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`role` text NOT NULL,
	`created_at` text NOT NULL
);
