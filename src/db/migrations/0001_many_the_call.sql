DROP TABLE "game";--> statement-breakpoint
ALTER TABLE "game_entry" DROP CONSTRAINT "game_entry_gameId_game_id_fk";
--> statement-breakpoint
ALTER TABLE "game_entry" ADD COLUMN "title" varchar(255);--> statement-breakpoint
ALTER TABLE "game_entry" ADD COLUMN "platformId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "game_entry" ADD COLUMN "genre" varchar[];--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "game_entry" ADD CONSTRAINT "game_entry_platformId_platform_id_fk" FOREIGN KEY ("platformId") REFERENCES "public"."platform"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "game_entry" DROP COLUMN IF EXISTS "gameId";