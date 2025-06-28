CREATE TABLE "photo_likes" (
	"photoUrl" varchar NOT NULL,
	"userId" text NOT NULL,
	"likedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "photo_likes_photoUrl_userId_pk" PRIMARY KEY("photoUrl","userId")
);
--> statement-breakpoint
ALTER TABLE "photo_likes" ADD CONSTRAINT "photo_likes_photoUrl_photos_url_fk" FOREIGN KEY ("photoUrl") REFERENCES "public"."photos"("url") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo_likes" ADD CONSTRAINT "photo_likes_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "photo_likes_idx" ON "photo_likes" USING btree ("photoUrl","userId");