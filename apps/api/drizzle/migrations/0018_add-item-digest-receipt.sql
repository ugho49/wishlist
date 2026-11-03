CREATE TABLE "item_digest_receipt" (
	"user_id" uuid NOT NULL,
	"digest_date" date NOT NULL,
	CONSTRAINT "item_digest_receipt_user_id_digest_date_pk" PRIMARY KEY("user_id","digest_date")
);
--> statement-breakpoint
ALTER TABLE "item_digest_receipt" ADD CONSTRAINT "item_digest_receipt_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;