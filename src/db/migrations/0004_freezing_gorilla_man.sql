ALTER TABLE "collection" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "collection" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;