CREATE TABLE "wishlist_message_read" (
	"user_id" uuid NOT NULL,
	"wishlist_id" uuid NOT NULL,
	"last_read_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wishlist_message_read_user_id_wishlist_id_pk" PRIMARY KEY("user_id","wishlist_id")
);
--> statement-breakpoint
ALTER TABLE "wishlist_message_read" ADD CONSTRAINT "wishlist_message_read_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_message_read" ADD CONSTRAINT "wishlist_message_read_wishlist_id_wishlist_id_fk" FOREIGN KEY ("wishlist_id") REFERENCES "public"."wishlist"("id") ON DELETE cascade ON UPDATE no action;
