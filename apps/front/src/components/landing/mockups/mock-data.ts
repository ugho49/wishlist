import { DateTime } from 'luxon';

/**
 * Fictional cast and wishes shown in the landing page mockups. Everything here must match
 * what the app really does: no prices (items have none), real labels, real behaviours.
 */

export type MockPerson = {
  firstName: string;
  lastName: string;
  initial: string;
  color: string;
};

export const people = {
  lea: { firstName: 'Léa', lastName: 'Martin', initial: 'L', color: '#255376' },
  thomas: { firstName: 'Thomas', lastName: 'Martin', initial: 'T', color: '#5B8DB0' },
  camille: { firstName: 'Camille', lastName: 'Roux', initial: 'C', color: '#6E9C94' },
  mamieJo: { firstName: 'Mamie Jo', lastName: 'Martin', initial: 'M', color: '#B07A88' },
  hugo: { firstName: 'Hugo', lastName: 'Bernard', initial: 'H', color: '#8580B5' },
  ines: { firstName: 'Inès', lastName: 'Petit', initial: 'I', color: '#4F7A93' },
  gabin: { firstName: 'Gabin', lastName: 'Martin', initial: '👶', color: '#E8F0F2' },
} satisfies Record<string, MockPerson>;

/** Pastel tiles behind the product emojis (product imagery only, never UI chrome). */
export const productTints = {
  mist: '#E8F0F2',
  sage: '#EAF3EC',
  rose: '#F9EDEF',
  lilac: '#EFEEF8',
} as const;

export type MockWish = {
  id: string;
  emoji: string;
  tint: string;
  name: string;
  details: string;
  /** Preference level, 1 to 5 hearts. */
  hearts: number;
  takers: MockPerson[];
  /** Suggested by a relative: shown to guests only, never to the list owner. */
  suggested?: boolean;
  addedDaysAgo: number;
};

export const leaWishes = {
  headphones: {
    id: 'headphones',
    emoji: '🎧',
    tint: productTints.mist,
    name: 'Casque audio sans fil',
    details: 'Coloris crème si possible',
    hearts: 5,
    takers: [people.camille, people.thomas],
    addedDaysAgo: 6,
  },
  camera: {
    id: 'camera',
    emoji: '📷',
    tint: productTints.lilac,
    name: 'Appareil photo instantané',
    details: 'Avec 2 recharges de films',
    hearts: 5,
    takers: [],
    addedDaysAgo: 4,
  },
  sneakers: {
    id: 'sneakers',
    emoji: '👟',
    tint: productTints.sage,
    name: 'Baskets en toile blanche',
    details: 'Pointure 39',
    hearts: 4,
    takers: [people.hugo],
    addedDaysAgo: 3,
  },
  monstera: {
    id: 'monstera',
    emoji: '🪴',
    tint: productTints.rose,
    name: 'Monstera en pot',
    details: 'Pot terracotta, environ 30 cm',
    hearts: 3,
    takers: [],
    addedDaysAgo: 2,
  },
  chocolate: {
    id: 'chocolate',
    emoji: '🍫',
    tint: productTints.rose,
    name: 'Atelier chocolat pour deux',
    details: 'Idée de Mamie Jo',
    hearts: 0,
    takers: [],
    suggested: true,
    addedDaysAgo: 1,
  },
} satisfies Record<string, MockWish>;

export const leaListTitle = 'Les envies de Léa';

/** Léa's birthday is always 12 days away, so the countdown chip reads "Dans 12 jours". */
export const leaBirthdayDate = (now: DateTime = DateTime.now()) => now.plus({ days: 12 }).startOf('day');

/** Next Christmas: this year's 25 December, or next year's once it is past. */
export const nextChristmasDate = (now: DateTime = DateTime.now()) => {
  const thisYear = DateTime.fromObject({ year: now.year, month: 12, day: 25 });
  return now.startOf('day') > thisYear ? thisYear.plus({ years: 1 }) : thisYear;
};

export const formatEventDate = (date: DateTime) =>
  date.setLocale('fr').toLocaleString({ weekday: 'long', day: 'numeric', month: 'long' });
