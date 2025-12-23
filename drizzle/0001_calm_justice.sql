CREATE TABLE `models_3d` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`petImageId` int NOT NULL,
	`jobId` varchar(100),
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`glbUrl` text,
	`previewUrl` text,
	`s3Key` varchar(500),
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `models_3d_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(50) NOT NULL,
	`userId` int NOT NULL,
	`model3dId` int NOT NULL,
	`printSizeId` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`unitPriceUsd` decimal(10,2) NOT NULL,
	`totalPriceUsd` decimal(10,2) NOT NULL,
	`status` enum('pending','paid','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`shippingName` varchar(100),
	`shippingAddress` text,
	`shippingCity` varchar(100),
	`shippingState` varchar(100),
	`shippingCountry` varchar(100),
	`shippingPostalCode` varchar(20),
	`shippingPhone` varchar(50),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`paypalOrderId` varchar(100),
	`paypalCaptureId` varchar(100),
	`amountUsd` decimal(10,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'USD',
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`payerEmail` varchar(255),
	`payerId` varchar(100),
	`rawResponse` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pet_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`originalUrl` text NOT NULL,
	`thumbnailUrl` text,
	`fileName` varchar(255),
	`fileSize` int,
	`mimeType` varchar(50),
	`width` int,
	`height` int,
	`s3Key` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pet_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `print_sizes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`description` text,
	`dimensions` varchar(50) NOT NULL,
	`priceUsd` decimal(10,2) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `print_sizes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`isEncrypted` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `system_config_id` PRIMARY KEY(`id`),
	CONSTRAINT `system_config_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;