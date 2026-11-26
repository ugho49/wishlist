-- Gifts reserved for a wishlist whose events are all over were bought before the purchase to-do existed.
-- Mark them as purchased, on the day of the last event of the wishlist (noon UTC, so the day stays the same
-- in every timezone), or on the reservation when it came later.
-- Same scope as the "Passés" tab: at least one linked event, none today or later. Wishlists without events
-- and wishlists with an upcoming event stay untouched, and an existing purchase is never overwritten.
UPDATE "item_taker" AS "taker"
SET "purchased_at" = GREATEST("past_wishlist"."last_event_at", "taker"."taken_at")
FROM "item",
  (
    SELECT
      "event_wishlist"."wishlist_id",
      (MAX("event"."event_date") + TIME '12:00') AT TIME ZONE 'UTC' AS "last_event_at"
    FROM "event_wishlist"
    INNER JOIN "event" ON "event"."id" = "event_wishlist"."event_id"
    GROUP BY "event_wishlist"."wishlist_id"
    HAVING MAX("event"."event_date") < CURRENT_DATE
  ) AS "past_wishlist"
WHERE "item"."id" = "taker"."item_id"
  AND "item"."wishlist_id" = "past_wishlist"."wishlist_id"
  AND "taker"."purchased_at" IS NULL;
