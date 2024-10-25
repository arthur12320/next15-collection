CREATE TABLE IF NOT EXISTS "gameentries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"game_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"purchased_at" timestamp DEFAULT now(),
	"purchased" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "games" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"platform" text NOT NULL,
	"image_url" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(100) NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gameentries" ADD CONSTRAINT "gameentries_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gameentries" ADD CONSTRAINT "gameentries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "gameentries_game_id_idx" ON "gameentries" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "gameentries_user_id_idx" ON "gameentries" USING btree ("user_id");