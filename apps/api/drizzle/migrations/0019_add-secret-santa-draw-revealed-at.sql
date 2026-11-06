ALTER TABLE "secret_santa_user" ADD COLUMN "draw_revealed_at" timestamp with time zone;
--> statement-breakpoint
UPDATE "secret_santa_user" SET "draw_revealed_at" = now() WHERE "draw_user_id" IS NOT NULL;