CREATE TYPE "public"."attendee_role" AS ENUM('creator', 'admin', 'participant');--> statement-breakpoint
CREATE TYPE "public"."secret_santa_status" AS ENUM('created', 'started');--> statement-breakpoint
CREATE TYPE "public"."user_authorities" AS ENUM('ROLE_USER', 'ROLE_ADMIN', 'ROLE_SUPERADMIN');--> statement-breakpoint
CREATE TYPE "public"."user_social_type" AS ENUM('google', 'facebook');--> statement-breakpoint
ALTER TABLE "event_attendee" ALTER COLUMN "role" SET DEFAULT 'participant'::"public"."attendee_role";--> statement-breakpoint
ALTER TABLE "event_attendee" ALTER COLUMN "role" SET DATA TYPE "public"."attendee_role" USING "role"::"public"."attendee_role";--> statement-breakpoint
ALTER TABLE "secret_santa" ALTER COLUMN "status" SET DATA TYPE "public"."secret_santa_status" USING "status"::"public"."secret_santa_status";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "authorities" SET DEFAULT '{"ROLE_USER"}'::"public"."user_authorities"[];--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "authorities" SET DATA TYPE "public"."user_authorities"[] USING "authorities"::"public"."user_authorities"[];--> statement-breakpoint
ALTER TABLE "user_social" ALTER COLUMN "social_type" SET DATA TYPE "public"."user_social_type" USING "social_type"::"public"."user_social_type";