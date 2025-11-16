ALTER TABLE "wishlist" ADD COLUMN "co_owner_id" uuid;--> statement-breakpoint
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_co_owner_id_user_id_fk" FOREIGN KEY ("co_owner_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
