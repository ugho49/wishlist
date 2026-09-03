# Wishlist

A gift-list sharing app: events, wishlists, items, attendees, and Secret Santa.

## Language

**User Session**:
A login of a user on a given device, kept alive by a rotating refresh token whose hash is stored on the session.
_Avoid_: refresh token (for the entity), user refresh token, `user_refresh_token`

**Refresh token**:
The secret credential that authenticates a User Session; only its hash is persisted.
_Avoid_: session token, access token
