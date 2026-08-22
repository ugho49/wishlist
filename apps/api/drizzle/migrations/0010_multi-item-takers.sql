CREATE TABLE "item_taker" (
	"item_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"taken_at" timestamp with time zone NOT NULL,
	CONSTRAINT "item_taker_item_id_user_id_pk" PRIMARY KEY("item_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "item" DROP CONSTRAINT "item_taker_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "item_taker" ADD CONSTRAINT "item_taker_item_id_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_taker" ADD CONSTRAINT "item_taker_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
INSERT INTO "item_taker" ("item_id", "user_id", "taken_at")
SELECT "id", "taker_id", COALESCE("taken_at", now())
FROM "item"
WHERE "taker_id" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "item" DROP COLUMN "taker_id";--> statement-breakpoint
ALTER TABLE "item" DROP COLUMN "taken_at";