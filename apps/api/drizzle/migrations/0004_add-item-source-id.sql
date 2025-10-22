ALTER TABLE "item" ADD COLUMN "import_source_id" uuid;--> statement-breakpoint
ALTER TABLE "item" ADD CONSTRAINT "item_import_source_id_item_id_fk" FOREIGN KEY ("import_source_id") REFERENCES "public"."item"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item" ADD CONSTRAINT "chk_import_source_id" CHECK (import_source_id IS DISTINCT FROM id);