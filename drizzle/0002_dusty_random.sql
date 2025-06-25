ALTER TABLE "photos" ALTER COLUMN "id" SET DEFAULT generated always as identity;--> statement-breakpoint
ALTER TABLE "photos" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "photos" ADD COLUMN "createdBy" text NOT NULL;--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_createdBy_users_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;