CREATE TYPE "public"."user_contact_status" AS ENUM('added', 'hidden');--> statement-breakpoint
CREATE TABLE "user_contact" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"contact_user_id" uuid NOT NULL,
	"status" "user_contact_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_contact_owner_user_id_contact_user_id_key" UNIQUE("owner_user_id","contact_user_id"),
	CONSTRAINT "chk_user_contact_not_self" CHECK (owner_user_id <> contact_user_id)
);
--> statement-breakpoint
ALTER TABLE "user_contact" ADD CONSTRAINT "user_contact_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_contact" ADD CONSTRAINT "user_contact_contact_user_id_fkey" FOREIGN KEY ("contact_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_contact_contact_user_id_idx" ON "user_contact" USING btree ("contact_user_id");