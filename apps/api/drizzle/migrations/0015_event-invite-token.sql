ALTER TABLE "event" ADD COLUMN "invite_token" varchar(64);--> statement-breakpoint
UPDATE "event" SET "invite_token" = replace(gen_random_uuid()::text, '-', '') WHERE "invite_token" IS NULL;--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "invite_token" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_invite_token_unique" UNIQUE("invite_token");
