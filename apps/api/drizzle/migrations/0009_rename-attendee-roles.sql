UPDATE "event_attendee" SET "role" = 'creator' WHERE "role" = 'maintainer';
--> statement-breakpoint
UPDATE "event_attendee" SET "role" = 'participant' WHERE "role" = 'user';
--> statement-breakpoint
ALTER TABLE "event_attendee" ALTER COLUMN "role" SET DEFAULT 'participant';