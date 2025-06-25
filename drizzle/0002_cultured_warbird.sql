ALTER TABLE "photos" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "photos" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;