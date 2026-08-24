import { descriptionMentionsSize, isClothingItemTitle, shouldShowClothingSizeHint } from './clothing.utils';

describe('clothing.utils', () => {
  describe('isClothingItemTitle', () => {
    it.each([
      'Pull Nike',
      'T-shirt blanc',
      'Tshirt Adidas',
      'Tee-shirt oversize',
      'Chaussures de running',
      'Baskets Air Max',
      'Jean slim',
      'Pantalon cargo',
      'Robe d été',
      'Veste en cuir',
      'Doudoune The North Face',
      'Sweat à capuche',
      'Hoodie noir',
      'Short de bain',
      'Maillot de foot',
      'Pyjama enfant',
      'Chaussettes invisibles',
      'Gants de ski',
      'Casquette NY',
      'Sneakers blanches',
      'Soutien-gorge',
      'Coupe-vent',
      'K-way jaune',
      'Vêtement de sport',
    ])('should detect clothing titles: "%s"', title => {
      expect(isClothingItemTitle(title)).toBe(true);
    });

    it.each(['PULL', 'Chaussure', 'vêtements', 'T-SHIRT', 'Jean'])(
      'should be accent-insensitive and case-insensitive: "%s"',
      title => {
        expect(isClothingItemTitle(title)).toBe(true);
      },
    );

    it.each([
      'Livre Harry Potter',
      'Console PS5',
      'Coffret thé',
      'Bougie parfumée',
      'Abonnement Spotify',
      'Lego Star Wars',
      'Normal day in Paris',
      'Jeanne',
      'Address book',
      'Bluetooth speaker',
      'Shortcut clavier',
    ])('should not match unrelated titles: "%s"', title => {
      expect(isClothingItemTitle(title)).toBe(false);
    });

    it.each(['', '   ', null, undefined])('should handle empty or invalid input: "%s"', title => {
      expect(isClothingItemTitle(title)).toBe(false);
    });
  });

  describe('descriptionMentionsSize', () => {
    it.each(['Taille M', 'taille : 42', 'Pointure 38', 'Size L', 'XS', 'XXL', 'T.M', 'T-L', '2XL'])(
      'should detect a size in "%s"',
      description => {
        expect(descriptionMentionsSize(description)).toBe(true);
      },
    );

    it.each(['Couleur bleu', 'Coton bio', 'Avec capuche', ''])('should not detect a size in "%s"', description => {
      expect(descriptionMentionsSize(description)).toBe(false);
    });
  });

  describe('shouldShowClothingSizeHint', () => {
    it('should show the hint for a clothing title without a size', () => {
      expect(shouldShowClothingSizeHint('Pull Nike', '')).toBe(true);
    });

    it('should hide the hint once a size is mentioned', () => {
      expect(shouldShowClothingSizeHint('Pull Nike', 'Taille M')).toBe(false);
    });

    it('should not show the hint for a non-clothing title', () => {
      expect(shouldShowClothingSizeHint('Livre Harry Potter', '')).toBe(false);
    });
  });
});
