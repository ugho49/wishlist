import type { Element } from 'domhandler';

import { type Cheerio, type CheerioAPI, load as loadHtml } from 'cheerio';

export const ITEM_NAME_MAX_LENGTH = 40;
export const ITEM_DESCRIPTION_MAX_LENGTH = 120;

export type ScrapedProduct = {
  title: string | null;
  description: string | null;
  rawImageUrl: string | null;
  price: number | null;
  currency: string | null;
  merchant: string | null;
};

export function parseProductFromHtml(html: string, pageUrl: string): ScrapedProduct {
  const $ = loadHtml(html);
  const jsonLd = extractJsonLdProducts($);

  const title = firstNonEmpty(
    metaContent($, ['og:title', 'twitter:title']),
    jsonLd.flatMap(product => [asString(product.name), asString(product.title)]),
    [$('h1').first().text(), $('title').text()],
  );

  const description = firstNonEmpty(
    metaContent($, ['og:description', 'twitter:description', 'description']),
    jsonLd.map(product => asString(product.description)),
  );

  const rawImageUrl = firstNonEmpty(
    metaContent($, ['og:image', 'og:image:url', 'twitter:image', 'twitter:image:src']),
    jsonLd.flatMap(product => imageFromJsonLd(product)),
    [findTitleImageUrl($, title ?? $('title').text())],
  );

  const priceAndCurrency = extractPrice($, jsonLd);

  const merchant = firstNonEmpty(
    metaContent($, ['og:site_name', 'application-name']),
    jsonLd.map(product => brandFromJsonLd(product)),
    [hostnameFromUrl(pageUrl)],
  );

  return {
    title: title ? truncate(cleanTitle(title), ITEM_NAME_MAX_LENGTH) : null,
    description: description ? truncate(collapseWhitespace(description), ITEM_DESCRIPTION_MAX_LENGTH) : null,
    rawImageUrl,
    price: priceAndCurrency.price,
    currency: priceAndCurrency.currency,
    merchant,
  };
}

function metaContent($: CheerioAPI, names: string[]): Array<string | null> {
  return names.map(name => {
    const element = $(`[property="${name}"], [name="${name}"]`).first();
    return element.attr('content') || element.attr('src') || null;
  });
}

function extractJsonLdProducts($: CheerioAPI): Record<string, unknown>[] {
  const products: Record<string, unknown>[] = [];

  $('script[type="application/ld+json"]').each((_, element) => {
    const raw = $(element).text();
    if (!raw.trim()) return;

    try {
      const parsed: unknown = JSON.parse(raw);
      collectProducts(parsed, products);
    } catch {
      // Ignore invalid JSON-LD blocks
    }
  });

  return products;
}

function collectProducts(value: unknown, acc: Record<string, unknown>[]): void {
  if (!value) return;

  if (Array.isArray(value)) {
    for (const entry of value) collectProducts(entry, acc);
    return;
  }

  if (typeof value !== 'object') return;

  const record = value as Record<string, unknown>;
  const type = record['@type'];
  let types: string[] = [];
  if (Array.isArray(type)) {
    types = type.map(String);
  } else if (type) {
    types = [String(type)];
  }

  if (types.some(entry => entry.toLowerCase() === 'product')) {
    acc.push(record);
  }

  if (record['@graph']) {
    collectProducts(record['@graph'], acc);
  }
}

function extractPrice(
  $: CheerioAPI,
  products: Record<string, unknown>[],
): { price: number | null; currency: string | null } {
  for (const product of products) {
    const fromOffers = priceFromOffers(product.offers);
    if (fromOffers.price !== null) return fromOffers;

    const direct = parsePrice(product.price);
    if (direct !== null) {
      return { price: direct, currency: asString(product.priceCurrency) };
    }
  }

  const metaPrice = firstNonEmpty(metaContent($, ['product:price:amount', 'og:price:amount', 'twitter:data1']), [
    $('[itemprop="price"]').attr('content') ?? $('[itemprop="price"]').text(),
  ]);
  const metaCurrency = firstNonEmpty(metaContent($, ['product:price:currency', 'og:price:currency']), [
    $('[itemprop="priceCurrency"]').attr('content') ?? $('[itemprop="priceCurrency"]').text(),
  ]);

  return { price: parsePrice(metaPrice), currency: metaCurrency };
}

function priceFromOffers(offers: unknown): { price: number | null; currency: string | null } {
  if (!offers) return { price: null, currency: null };

  const list = Array.isArray(offers) ? offers : [offers];
  for (const offer of list) {
    if (!offer || typeof offer !== 'object') continue;
    const record = offer as Record<string, unknown>;
    const price = parsePrice(record.price ?? record.lowPrice);
    if (price !== null) {
      return { price, currency: asString(record.priceCurrency) };
    }
  }

  return { price: null, currency: null };
}

function imageFromJsonLd(product: Record<string, unknown>): Array<string | null> {
  const image = product.image;
  if (typeof image === 'string') return [image];
  if (Array.isArray(image)) {
    return image.map(entry => (typeof entry === 'string' ? entry : asString((entry as Record<string, unknown>)?.url)));
  }
  if (image && typeof image === 'object') {
    return [asString((image as Record<string, unknown>).url)];
  }
  return [];
}

function brandFromJsonLd(product: Record<string, unknown>): string | null {
  const brand = product.brand;
  if (typeof brand === 'string') return brand;
  if (brand && typeof brand === 'object') {
    return asString((brand as Record<string, unknown>).name);
  }
  return null;
}

function findTitleImageUrl($: CheerioAPI, title: string): string | null {
  if (!title) return null;

  let titleImageElements: Cheerio<Element> = $(`img[alt*="${cssEscape(title)}"]`);
  if (titleImageElements.length === 0) {
    titleImageElements = $(`img[alt*="${cssEscape(title.split(' : Amazon')[0] ?? title)}"]`);
  }
  if (titleImageElements.length === 0 && title.length >= 8) {
    titleImageElements = $(`img[alt*="${cssEscape(title.substring(0, 20))}"]`);
  }
  if (titleImageElements.length === 0) return null;

  const imgUrls = titleImageElements
    .toArray()
    .map(element => element.attribs['data-src'] || element.attribs.src)
    .filter((url): url is string => Boolean(url));

  return imgUrls[0] ?? null;
}

function parsePrice(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return roundPrice(value);
  }

  if (typeof value !== 'string') return null;

  const normalized = value
    .replace(/\s/g, '')
    .replace(',', '.')
    .replace(/[^\d.]/g, '');
  if (!normalized) return null;

  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return null;

  return roundPrice(parsed);
}

function roundPrice(value: number): number {
  return Math.round(value * 100) / 100;
}

function cleanTitle(title: string): string {
  return collapseWhitespace(title.replace(/\s*[|:–-]\s*Amazon(\.[a-z]+)?.*$/i, ''));
}

function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;

  const sliced = value.slice(0, max);
  const lastSpace = sliced.lastIndexOf(' ');
  const cut = lastSpace > max * 0.6 ? sliced.slice(0, lastSpace) : sliced;
  return cut.trim();
}

function hostnameFromUrl(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

function firstNonEmpty(...groups: Array<Array<string | null | undefined>>): string | null {
  for (const group of groups) {
    for (const value of group) {
      if (value && value.trim() !== '') return value.trim();
    }
  }
  return null;
}

function cssEscape(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}
