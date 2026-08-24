function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function tokenize(value: string): string[] {
  const normalized = normalizeText(value)
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  if (!normalized) return [];

  return normalized.split(/\s+/);
}

/**
 * Garment types that typically need a size (FR + common EN).
 * Short generic words like "top" or "haut" are omitted to avoid false positives.
 */
const CLOTHING_WORDS = new Set([
  'ballerine',
  'ballerines',
  'basket',
  'baskets',
  'bermuda',
  'bermudas',
  'blazer',
  'blazers',
  'blouse',
  'blouses',
  'blouson',
  'blousons',
  'bonnet',
  'bonnets',
  'boot',
  'boots',
  'botte',
  'bottes',
  'bottine',
  'bottines',
  'boxer',
  'boxers',
  'brassiere',
  'brassieres',
  'calecon',
  'calecons',
  'cardigan',
  'cardigans',
  'casquette',
  'casquettes',
  'ceinture',
  'ceintures',
  'chapeau',
  'chapeaux',
  'chaussette',
  'chaussettes',
  'chausson',
  'chaussons',
  'chaussure',
  'chaussures',
  'chemise',
  'chemises',
  'chemisier',
  'chemisiers',
  'claquette',
  'claquettes',
  'coat',
  'coats',
  'collant',
  'collants',
  'combinaison',
  'combinaisons',
  'costume',
  'costumes',
  'culotte',
  'culottes',
  'debardeur',
  'debardeurs',
  'derby',
  'derbys',
  'doudoune',
  'doudounes',
  'dress',
  'dresses',
  'escarpin',
  'escarpins',
  'gant',
  'gants',
  'gilet',
  'gilets',
  'hoodie',
  'hoodies',
  'imper',
  'impermeable',
  'impermeables',
  'jacket',
  'jackets',
  'jean',
  'jeans',
  'jogging',
  'joggings',
  'jumper',
  'jumpers',
  'jupe',
  'jupes',
  'kimono',
  'kimonos',
  'kway',
  'kways',
  'legging',
  'leggings',
  'lingerie',
  'maillot',
  'maillots',
  'manteau',
  'manteaux',
  'mocassin',
  'mocassins',
  'nuisette',
  'nuisettes',
  'pantoufle',
  'pantoufles',
  'pantalon',
  'pantalons',
  'pants',
  'parka',
  'parkas',
  'peignoir',
  'peignoirs',
  'polo',
  'polos',
  'pull',
  'pullover',
  'pullovers',
  'pulls',
  'pyjama',
  'pyjamas',
  'richelieu',
  'richelieus',
  'robe',
  'robes',
  'sabot',
  'sabots',
  'salopette',
  'salopettes',
  'sandale',
  'sandales',
  'shirt',
  'shirts',
  'short',
  'shorts',
  'skirt',
  'skirts',
  'slip',
  'slips',
  'smoking',
  'smokings',
  'sneaker',
  'sneakers',
  'socks',
  'survet',
  'survetement',
  'survetements',
  'sweat',
  'sweater',
  'sweaters',
  'sweats',
  'sweatshirt',
  'sweatshirts',
  'teeshirt',
  'teeshirts',
  'tong',
  'tongs',
  'trench',
  'trenchs',
  'trousers',
  'tshirt',
  'tshirts',
  'tunique',
  'tuniques',
  'veste',
  'vestes',
  'vetement',
  'vetements',
]);

const CLOTHING_COMPOUNDS = new Set(['soutiengorge', 'coupevent', 'croptop']);

const SIZE_KEYWORDS = new Set(['taille', 'pointure', 'size', 'sizes']);

const SIZE_TOKENS = new Set(['xxxs', 'xxs', 'xs', 'xl', 'xxl', 'xxxl', 'xxxxl', '2xl', '3xl', '4xl', '5xl']);

export function isClothingItemTitle(title: string | null | undefined): boolean {
  if (!title?.trim()) return false;

  const words = tokenize(title);
  if (words.some(word => CLOTHING_WORDS.has(word))) return true;

  for (let i = 0; i < words.length - 1; i++) {
    const compound = `${words[i]}${words[i + 1]}`;
    if (CLOTHING_COMPOUNDS.has(compound) || CLOTHING_WORDS.has(compound)) return true;
  }

  return false;
}

export function descriptionMentionsSize(description: string | null | undefined): boolean {
  if (!description?.trim()) return false;

  const words = tokenize(description);
  if (words.some(word => SIZE_KEYWORDS.has(word) || SIZE_TOKENS.has(word))) return true;

  return /\bt(?:\s+[.-]?\s*)?(?:xxs|xs|s|m|l|xl|xxl|\d{2,3})\b/.test(words.join(' '));
}

export function shouldShowClothingSizeHint(
  title: string | null | undefined,
  description: string | null | undefined,
): boolean {
  return isClothingItemTitle(title) && !descriptionMentionsSize(description);
}
