export const ADMIN_USER = {
  id: 'bc675663-8dce-4977-a4ab-146db663580e',
  email: 'admin@admin.fr',
  firstName: 'Admin',
  lastName: 'ADMIN',
} as const;

export const seedConfig = {
  users: {
    password: 'test',
    count: 100,
    dailyNewItemNotificationProbability: 0.9,
    birthdayReminderProbability: 0.9,
    christmasReminderProbability: 0.9,
  },
  events: {
    count: 100,
    pastProbability: 0.3,
    descriptionProbability: 0.3,
  },
  attendees: {
    extraPerEvent: { min: 0, max: 10 },
    tempUserProbability: 0.2,
  },
  wishlists: {
    ownerHasWishlistProbability: 0.7,
    perOwner: { min: 1, max: 5 },
    descriptionProbability: 0.3,
    hideItemsProbability: 0.99,
    multipleEventsProbability: 0.2,
  },
  items: {
    perWishlist: { min: 0, max: 10 },
    suggestedProbability: 0.1,
    descriptionProbability: 0.3,
    scoreProbability: 0.4,
  },
  itemTakers: {
    takenProbability: 0.35,
    perItem: { min: 1, max: 3 },
  },
} as const;
