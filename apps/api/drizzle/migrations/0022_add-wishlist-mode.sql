CREATE TYPE "public"."wishlist_mode" AS ENUM('surprise', 'shared');--> statement-breakpoint
ALTER TABLE "wishlist" ADD COLUMN "mode" "wishlist_mode" DEFAULT 'surprise' NOT NULL;--> statement-breakpoint
UPDATE "wishlist" SET "mode" = 'shared' WHERE "hide_items" = false;
