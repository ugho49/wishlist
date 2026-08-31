CREATE TABLE "user_refresh_token" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"user_agent" varchar(1000),
	"ip" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	CONSTRAINT "user_refresh_token_token_hash_key" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "user_refresh_token" ADD CONSTRAINT "user_refresh_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_refresh_token_user_id_idx" ON "user_refresh_token" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_refresh_token_user_id_active_idx" ON "user_refresh_token" USING btree ("user_id") WHERE "user_refresh_token"."revoked_at" IS NULL;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "last_ip";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "last_connected_at";