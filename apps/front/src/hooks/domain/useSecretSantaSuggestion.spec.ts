import { containsChristmasKeyword } from './useSecretSantaSuggestion'

describe('useSecretSantaSuggestion', () => {
  describe('containsChristmasKeyword', () => {
    it.each([
      'Joyeux Noël à tous',
      'Merry Christmas everyone',
      'Xmas Party tonight',
      'X-mas vibes',
    ])('should detect classic Christmas keywords: "%s"', title => {
      expect(containsChristmasKeyword(title)).toBe(true)
    })

    it.each([
      'Feliz Navidad!',
      'Buon Natale a tutti',
      'Frohe Weihnachten!',
    ])('should detect multilingual Christmas keywords: "%s"', title => {
      expect(containsChristmasKeyword(title)).toBe(true)
    })

    it.each([
      'Le Père Noël arrive bientôt',
      'Sapin de Noël décoré',
      'Réveillon du 24 décembre',
      'Calendrier de l’avent 2025',
    ])('should detect other Christmas-related terms: "%s"', title => {
      expect(containsChristmasKeyword(title)).toBe(true)
    })

    it.each(['NOEL', 'noël', 'Noel', 'nöel'])('should be accent-insensitive and case-insensitive: "%s"', title => {
      expect(containsChristmasKeyword(title)).toBe(true)
    })

    it.each([
      'Chrismas vibes', // typo
      'Noellish night',
      'SantaClaus special',
      'X mas celebration',
      'Christmass dinner', // extra "s"
    ])('should detect fuzzy matches with typos or variants: "%s"', title => {
      expect(containsChristmasKeyword(title)).toBe(true)
    })

    it.each([
      'Normal day in Paris',
      'Summer holidays in July',
      'Autumn festival',
      'Winter wonderland', // not explicitly Christmas
    ])('should not match unrelated or false positive titles: "%s"', title => {
      expect(containsChristmasKeyword(title)).toBe(false)
    })

    it.each(['', null, undefined])('should handle empty or invalid input gracefully: "%s"', title => {
      // @ts-expect-error — intentional invalid inputs for testing robustness
      expect(containsChristmasKeyword(title)).toBe(false)
    })
  })
})
