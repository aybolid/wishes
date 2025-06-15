CREATE TABLE `labels` (
	`label_id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`creator_id` text NOT NULL,
	FOREIGN KEY (`creator_id`) REFERENCES `users`(`user_id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `labels_name_unique` ON `labels` (`name`);--> statement-breakpoint
CREATE TABLE `metadata_fields` (
	`field_id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`creator_id` text NOT NULL,
	`config` text NOT NULL,
	FOREIGN KEY (`creator_id`) REFERENCES `users`(`user_id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `metadata_fields_name_unique` ON `metadata_fields` (`name`);--> statement-breakpoint
CREATE TABLE `metadata_values` (
	`value_id` integer PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`metadata_field_id` integer NOT NULL,
	`wish_id` integer NOT NULL,
	FOREIGN KEY (`metadata_field_id`) REFERENCES `metadata_fields`(`field_id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`wish_id`) REFERENCES `wishes`(`wish_id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`session_id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`user_id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE TABLE `wishes` (
	`wish_id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`description` text NOT NULL,
	`creator_id` text NOT NULL,
	FOREIGN KEY (`creator_id`) REFERENCES `users`(`user_id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `wishes_to_labels` (
	`id` integer PRIMARY KEY NOT NULL,
	`wish_id` integer NOT NULL,
	`label_id` integer NOT NULL,
	FOREIGN KEY (`wish_id`) REFERENCES `wishes`(`wish_id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`label_id`) REFERENCES `labels`(`label_id`) ON UPDATE cascade ON DELETE cascade
);
