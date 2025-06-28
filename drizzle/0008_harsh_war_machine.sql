CREATE TYPE "public"."notification_type" AS ENUM('global', 'specific', 'warning', 'info', 'alert', 'like');--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" varchar(49) NOT NULL,
	"description" varchar(500) NOT NULL,
	"readStatus" boolean DEFAULT false,
	"notificationOf" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_notificationOf_users_id_fk" FOREIGN KEY ("notificationOf") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;