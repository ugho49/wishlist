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

function matchesKeywords(words: string[], keywords: Set<string>, compounds: Set<string> = new Set()): boolean {
  if (words.some(word => keywords.has(word))) return true;

  for (let i = 0; i < words.length - 1; i++) {
    const compound = `${words[i]}${words[i + 1]}`;
    if (compounds.has(compound) || keywords.has(compound)) return true;
  }

  return false;
}

/**
 * Footwear that needs a shoe size / pointure (FR + common EN).
 */
const SHOE_WORDS = new Set([
  'ballerine',
  'ballerines',
  'basket',
  'baskets',
  'boot',
  'boots',
  'botte',
  'bottes',
  'bottine',
  'bottines',
  'chausson',
  'chaussons',
  'chaussure',
  'chaussures',
  'claquette',
  'claquettes',
  'derby',
  'derbys',
  'escarpin',
  'escarpins',
  'mocassin',
  'mocassins',
  'pantoufle',
  'pantoufles',
  'richelieu',
  'richelieus',
  'sabot',
  'sabots',
  'sandale',
  'sandales',
  'sneaker',
  'sneakers',
  'tong',
  'tongs',
]);

/**
 * Garment types that typically need a clothing size / taille (FR + common EN).
 * Short generic words like "top" or "haut" are omitted to avoid false positives.
 */
const GARMENT_WORDS = new Set([
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
  'chemise',
  'chemises',
  'chemisier',
  'chemisiers',
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
  'doudoune',
  'doudounes',
  'dress',
  'dresses',
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
  'nuisette',
  'nuisettes',
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
  'robe',
  'robes',
  'salopette',
  'salopettes',
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

const GARMENT_COMPOUNDS = new Set(['soutiengorge', 'coupevent', 'croptop']);

const SIZE_KEYWORDS = new Set(['taille', 'pointure', 'size', 'sizes']);

const SIZE_TOKENS = new Set(['xxxs', 'xxs', 'xs', 'xl', 'xxl', 'xxxl', 'xxxxl', '2xl', '3xl', '4xl', '5xl']);

export type ClothingKind = 'shoe' | 'garment';

export function getClothingKind(title: string | null | undefined): ClothingKind | null {
  if (!title?.trim()) return null;

  const words = tokenize(title);
  if (matchesKeywords(words, SHOE_WORDS)) return 'shoe';
  if (matchesKeywords(words, GARMENT_WORDS, GARMENT_COMPOUNDS)) return 'garment';

  return null;
}

export function isClothingItemTitle(title: string | null | undefined): boolean {
  return getClothingKind(title) !== null;
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
  return getClothingSizeHintKind(title, description) !== null;
}

export function getClothingSizeHintKind(
  title: string | null | undefined,
  description: string | null | undefined,
): ClothingKind | null {
  const kind = getClothingKind(title);
  if (!kind || descriptionMentionsSize(description)) return null;
  return kind;
}

export function getClothingDetailsPlaceholder(kind: ClothingKind | null): string {
  if (kind === 'shoe') return 'Ex : Pointure 42, couleur…';
  if (kind === 'garment') return 'Ex : Taille M, couleur, matière…';
  return 'Ajouter du détail à votre souhait';
}
