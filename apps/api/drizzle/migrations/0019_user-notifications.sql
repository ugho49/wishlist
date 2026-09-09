CREATE TYPE "public"."user_notification_type" AS ENUM('item_reserved', 'secret_santa_drawn', 'new_guest', 'event_reminder');--> statement-breakpoint
CREATE TABLE "user_notification" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "user_notification_type" NOT NULL,
	"title" varchar(200) NOT NULL,
	"body" varchar(500) NOT NULL,
	"event_id" uuid,
	"wishlist_id" uuid,
	"item_id" uuid,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_notification" ADD CONSTRAINT "user_notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;