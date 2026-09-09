import type { drizzle } from 'drizzle-orm/bun-sql';
import type * as schema from '../schema';

export type SeedDb = ReturnType<typeof drizzle>;

export type UserSeed = typeof schema.user.$inferInsert;
export type UserAccountSeed = typeof schema.userAccount.$inferInsert;
export type UserEmailSettingSeed = typeof schema.userEmailSetting.$inferInsert;
export type EventSeed = typeof schema.event.$inferInsert;
export type EventAttendeeSeed = typeof schema.eventAttendee.$inferInsert;
export type WishlistSeed = typeof schema.wishlist.$inferInsert;
export type EventWishlistSeed = typeof schema.eventWishlist.$inferInsert;
export type ItemSeed = typeof schema.item.$inferInsert;
export type ItemTakerSeed = typeof schema.itemTaker.$inferInsert;
