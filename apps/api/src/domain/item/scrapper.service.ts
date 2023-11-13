import { Injectable, Logger } from '@nestjs/common';
import { Cheerio, Element, load as loadHtml } from 'cheerio';

@Injectable()
export class ScrapperService {
  private readonly logger = new Logger(ScrapperService.name);

  private async fetch(url: string, { timeout, method } = { timeout: 1_500, method: 'GET' }) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      return await fetch(url, {
        signal: controller.signal,
        method,
        headers: {
          'User-Agent': this.getRandomUA(),
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept-Language': 'en,fr;q=0.9,fr-FR;q=0.8',
          Referer: 'https://www.google.com/',
          'Cache-Control': 'max-age=0',
          Connection: 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          DNT: '1', // Do Not Track
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
        },
      });
    } catch (e) {
      throw new Error(`Timeout: ${timeout}ms`);
    } finally {
      clearTimeout(id);
    }
  }

  private baseHostname(url: string) {
    const url1 = new URL(url);
    return `${url1.protocol}//${url1.hostname}`;
  }

  private getRandomUA(): string {
    const UAs = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/91.0.864.54 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36 Edg/91.0.864.37',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36 Edg/89.0.774.77',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/76.0.4017.123',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36 Edg/89.0.774.77',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 YaBrowser/21.6.0.616 Yowser/2.5 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/77.0.4054.64',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36 Edg/89.0.774.68',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36 Edg/91.0.864.37',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 EdgA/91.0.864.48',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.54',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.48',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/76.0.4017.107',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/76.0.4017.123',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/76.0.4017.107',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/77.0.4054.64',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/77.0.4054.64',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/76.0.4017.107',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/76.0.4017.123',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/77.0.4054.64',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/76.0.4017.107',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/76.0.4017.123',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/76.0.4017.107',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/76.0.4017.123',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/77.0.4054.64',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/77.0.4054.64',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/76.0.4017.107',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/76.0.4017.123',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/77.0.4054.64',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/77.0.4054.64',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/76.0.4017.107',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/76.0.4017.123',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/77.0.4054.64',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/77.0.4054.64',
    ];

    const randomIndex = Math.floor(Math.random() * UAs.length);
    return UAs[randomIndex];
  }

  // Fonction pour extraire la partie de droite de l'URL
  private extractRightPart(url: string) {
    const lastHttpIndex = url.lastIndexOf('http');
    if (lastHttpIndex !== -1) {
      return url.substring(lastHttpIndex);
    }
    return url;
  }

  private isValidUrl(url: string) {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  private async sanitizeAndCheckUrl(params: { imageUrl: string; websiteUrl: string }) {
    let sanitizedImageUrl = params.imageUrl;

    if (sanitizedImageUrl.startsWith('//')) {
      sanitizedImageUrl = `https:${sanitizedImageUrl}`;
    }

    if (sanitizedImageUrl.startsWith('/')) {
      const baseWebsiteUrl = this.baseHostname(params.websiteUrl);
      sanitizedImageUrl = `${baseWebsiteUrl}${sanitizedImageUrl}`;
    }

    sanitizedImageUrl = decodeURIComponent(sanitizedImageUrl);

    // Extraire la partie de droite de l'URL
    const rightPart = this.extractRightPart(sanitizedImageUrl);

    this.logger.log('Image principale trouvée:', rightPart);

    // Vérifier si l'image est accessible
    const imageResponse = await this.fetch(rightPart, { method: 'HEAD', timeout: 1_500 });
    if (!(imageResponse.status >= 200 && imageResponse.status < 300)) {
      this.logger.warn("L'image n'est pas accessible. Statut:", imageResponse.status);
      return null;
    }

    this.logger.log("L'image est accessible.");

    return rightPart;
  }

  private hasBotDetection(html: string) {
    const keywords = [
      '<title>Attention Required! | Cloudflare</title>',
      '<p id="cmsg">Please enable JS and disable any ad blocker</p>',
    ];
    return keywords.some((keyword) => html.includes(keyword));
  }

  private getBiggestImage(titleImageElements: Cheerio<Element>) {
    if (titleImageElements.length === 0) return null;

    const imgUrls = titleImageElements
      .toArray()
      .map((element) => {
        const url = element.attribs['data-src'] || element.attribs['src'];
        const path = this.isValidUrl(url) ? new URL(url).pathname : url;
        return { url, path };
      })
      .sort((a, b) => a.path.localeCompare(b.path));

    return imgUrls[0].url;
  }

  async scanUrl(url: string) {
    try {
      this.logger.log('Scrap img for => ', { url });

      const response = await this.fetch(url);
      const html = await response.text();

      if (this.hasBotDetection(html)) {
        this.logger.log('Bot detection detected.');
        return null;
      }

      // Charger le contenu HTML dans Cheerio
      const $ = loadHtml(html);

      const title = $('title').text().trim();
      const mainImageElement = $('[property="og:image"], [name="og:image"]');

      const ogImageUrl = mainImageElement.attr('content') || mainImageElement.attr('src');

      if (ogImageUrl) {
        return await this.sanitizeAndCheckUrl({ imageUrl: ogImageUrl, websiteUrl: url });
      }

      const titleImageElements: Cheerio<Element> = $(
        `img[alt*="${title}"], img[alt*="${title.split(' : Amazon')[0]}"], img[alt*="${title.substring(0, 20)}"]`,
      );
      const titleImageUrl = this.getBiggestImage(titleImageElements);

      if (titleImageUrl) {
        return await this.sanitizeAndCheckUrl({ imageUrl: titleImageUrl, websiteUrl: url });
      }

      this.logger.log('Aucune image principale trouvée.');
      return null;
    } catch (error) {
      this.logger.error("Une erreur s'est produite lors de la récupération de l'image:", error);
      return null;
    }
  }
}
