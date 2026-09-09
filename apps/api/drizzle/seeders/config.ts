export const ADMIN_USER = {
  id: '00000000-0000-0000-0000-000000000000',
  email: 'admin@admin.fr',
  firstName: 'Admin',
  lastName: 'ADMIN',
} as const;

export const seedConfig = {
  users: {
    password: 'test',
    count: 500,
    dailyNewItemNotificationProbability: 0.9,
  },
  events: {
    count: 1000,
    pastProbability: 0.3,
    descriptionProbability: 0.3,
    iconProbability: 0.5,
  },
  attendees: {
    extraPerEvent: { min: 0, max: 10 },
    tempUserProbability: 0.2,
  },
  wishlists: {
    ownerHasWishlistProbability: 0.8,
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
