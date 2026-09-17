CREATE EXTENSION IF NOT EXISTS pg_trgm;
--> statement-breakpoint
CREATE INDEX "event_title_trgm_idx" ON "event" USING gin ("title" gin_trgm_ops);
