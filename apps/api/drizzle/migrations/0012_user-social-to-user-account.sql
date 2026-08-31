CREATE TYPE "public"."user_account_provider" AS ENUM('password', 'google', 'facebook');--> statement-breakpoint
CREATE TABLE "user_account" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" "user_account_provider" NOT NULL,
	"email" varchar(200) NOT NULL,
	"provider_account_id" varchar(1000),
	"password_hash" varchar(500),
	"picture_url" varchar(1000),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_account" ADD CONSTRAINT "user_account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_account" ADD CONSTRAINT "user_account_user_id_provider_key" UNIQUE("user_id","provider");--> statement-breakpoint
CREATE UNIQUE INDEX "user_account_provider_provider_account_id_key" ON "user_account" USING btree ("provider","provider_account_id") WHERE "user_account"."provider_account_id" IS NOT NULL;--> statement-breakpoint
INSERT INTO "user_account" ("id", "user_id", "provider", "email", "provider_account_id", "password_hash", "picture_url", "created_at", "updated_at")
SELECT "id", "user_id", "social_type"::text::"user_account_provider", "email", "social_id", NULL, "picture_url", "created_at", "updated_at"
FROM "user_social";--> statement-breakpoint
INSERT INTO "user_account" ("id", "user_id", "provider", "email", "provider_account_id", "password_hash", "picture_url", "created_at", "updated_at")
SELECT gen_random_uuid(), "id", 'password'::"user_account_provider", "email", NULL, "password_enc", NULL, "created_at", now()
FROM "user"
WHERE "password_enc" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "password_enc";--> statement-breakpoint
DROP TABLE "user_social";--> statement-breakpoint
DROP TYPE "public"."user_social_type";
