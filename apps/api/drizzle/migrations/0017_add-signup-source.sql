CREATE TYPE "public"."signup_source" AS ENUM('google', 'friends', 'social', 'other');--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "signup_source" "signup_source";--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "signup_source_detail" varchar(200);