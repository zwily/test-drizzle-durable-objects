CREATE TABLE `messages` (
	`id` integer PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`user` text,
	`message` text
);
