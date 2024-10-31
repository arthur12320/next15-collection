CREATE TABLE IF NOT EXISTS "game_entry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bought" boolean NOT NULL,
	"bought_date" timestamp,
	"image_url" varchar(2048) NOT NULL,
	"userId" uuid NOT NULL,
	"gameId" uuid NOT NULL,
	"collectionId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "game" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255),
	"platformId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "platform" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255)
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "game_entry" ADD CONSTRAINT "game_entry_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "game_entry" ADD CONSTRAINT "game_entry_gameId_game_id_fk" FOREIGN KEY ("gameId") REFERENCES "public"."game"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "game_entry" ADD CONSTRAINT "game_entry_collectionId_collection_id_fk" FOREIGN KEY ("collectionId") REFERENCES "public"."collection"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "game" ADD CONSTRAINT "game_platformId_platform_id_fk" FOREIGN KEY ("platformId") REFERENCES "public"."platform"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
