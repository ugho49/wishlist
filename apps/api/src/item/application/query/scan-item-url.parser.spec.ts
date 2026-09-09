import { parseProductFromHtml } from './scan-item-url.parser';
import { describe, expect, it } from 'bun:test';

describe('parseProductFromHtml', () => {
  it('should extract open graph title, description, image, price and merchant', () => {
    const html = `
      <html>
        <head>
          <meta property="og:title" content="Lampe de chevet : Amazon.fr" />
          <meta property="og:description" content="Une belle lampe pour la chambre." />
          <meta property="og:image" content="https://cdn.example.com/lampe.jpg" />
          <meta property="og:site_name" content="Amazon" />
          <meta property="product:price:amount" content="29,90" />
          <meta property="product:price:currency" content="EUR" />
        </head>
      </html>
    `;

    expect(parseProductFromHtml(html, 'https://www.amazon.fr/lampe')).toEqual({
      title: 'Lampe de chevet',
      description: 'Une belle lampe pour la chambre.',
      rawImageUrl: 'https://cdn.example.com/lampe.jpg',
      price: 29.9,
      currency: 'EUR',
      merchant: 'Amazon',
    });
  });

  it('should extract a product from JSON-LD', () => {
    const html = `
      <html>
        <head>
          <script type="application/ld+json">
            {
              "@type": "Product",
              "name": "Coffret thé premium beaucoup trop long pour tenir dans le champ titre",
              "description": "Un coffret de thés d'exception pour les amateurs.",
              "image": "https://cdn.example.com/the.jpg",
              "brand": { "name": "Kusmi" },
              "offers": { "price": "42.00", "priceCurrency": "EUR" }
            }
          </script>
        </head>
      </html>
    `;

    const scraped = parseProductFromHtml(html, 'https://boutique.example.com/the');

    expect(scraped.title).toBe('Coffret thé premium beaucoup trop long');
    expect(scraped.title?.length).toBeLessThanOrEqual(40);
    expect(scraped.description).toBe("Un coffret de thés d'exception pour les amateurs.");
    expect(scraped.rawImageUrl).toBe('https://cdn.example.com/the.jpg');
    expect(scraped.price).toBe(42);
    expect(scraped.currency).toBe('EUR');
    expect(scraped.merchant).toBe('Kusmi');
  });

  it('should fall back to the page hostname when no merchant is present', () => {
    const html = '<html><head><title>Un mug</title></head></html>';

    expect(parseProductFromHtml(html, 'https://www.fnac.com/mug').merchant).toBe('fnac.com');
    expect(parseProductFromHtml(html, 'https://www.fnac.com/mug').title).toBe('Un mug');
  });
});
