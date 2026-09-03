CREATE TYPE "public"."user_session_device_type" AS ENUM('mobile', 'tablet', 'desktop', 'unknown');--> statement-breakpoint

ALTER TABLE "user_refresh_token" RENAME TO "user_session";--> statement-breakpoint

ALTER TABLE "user_session" RENAME CONSTRAINT "user_refresh_token_user_id_fkey" TO "user_session_user_id_fkey";--> statement-breakpoint
ALTER TABLE "user_session" RENAME CONSTRAINT "user_refresh_token_token_hash_key" TO "user_session_token_hash_key";--> statement-breakpoint
ALTER INDEX "user_refresh_token_user_id_idx" RENAME TO "user_session_user_id_idx";--> statement-breakpoint
ALTER INDEX "user_refresh_token_user_id_active_idx" RENAME TO "user_session_user_id_active_idx";--> statement-breakpoint

ALTER TABLE "user_session" ADD COLUMN "browser" varchar(100) DEFAULT 'Navigateur inconnu' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_session" ADD COLUMN "browser_version" varchar(50);--> statement-breakpoint
ALTER TABLE "user_session" ADD COLUMN "os" varchar(100) DEFAULT 'Système inconnu' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_session" ADD COLUMN "os_version" varchar(50);--> statement-breakpoint
ALTER TABLE "user_session" ADD COLUMN "device_type" "user_session_device_type" DEFAULT 'unknown' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_session" ADD COLUMN "vendor" varchar(100);--> statement-breakpoint
ALTER TABLE "user_session" ADD COLUMN "model" varchar(100);--> statement-breakpoint
ALTER TABLE "user_session" ADD COLUMN "label" varchar(200) DEFAULT 'Appareil inconnu' NOT NULL;--> statement-breakpoint

CREATE INDEX "user_session_revoked_at_idx" ON "user_session" USING btree ("revoked_at") WHERE "user_session"."revoked_at" IS NOT NULL;
