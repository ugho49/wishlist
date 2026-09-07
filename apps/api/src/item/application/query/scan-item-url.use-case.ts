import { Injectable, Logger } from '@nestjs/common';

import { parseProductFromHtml } from './scan-item-url.parser';

export type ScanItemUrlInput = {
  url: string;
};

export type ScanItemUrlOutput = {
  title: string | null;
  description: string | null;
  pictureUrl: string | null;
  price: number | null;
  currency: string | null;
  merchant: string | null;
};

@Injectable()
export class ScanItemUrlUseCase {
  private readonly logger = new Logger(ScanItemUrlUseCase.name);

  async execute(query: ScanItemUrlInput): Promise<ScanItemUrlOutput> {
    try {
      this.logger.log('Scan product url', { url: query.url });

      const response = await this.fetch(query.url, { timeout: 3_000, method: 'GET' });
      const html = await response.text();

      if (!html) {
        this.logger.warn('No html found');
        return emptyScanResult();
      }

      if (this.hasBotDetection(html)) {
        this.logger.log('Bot detection detected.');
        return emptyScanResult();
      }

      const scraped = parseProductFromHtml(html, query.url);
      const pictureUrl = scraped.rawImageUrl
        ? await this.sanitizeAndCheckUrl({ imageUrl: scraped.rawImageUrl, websiteUrl: query.url })
        : null;

      return {
        title: scraped.title,
        description: scraped.description,
        pictureUrl,
        price: scraped.price,
        currency: scraped.currency,
        merchant: scraped.merchant,
      };
    } catch (error) {
      this.logger.error('Failed to scan product url', error);
      return emptyScanResult();
    }
  }

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
          Authority: new URL(url).hostname,
          'Cache-Control': 'max-age=0',
          Connection: 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          DNT: '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
        },
      });
    } catch {
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
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    ];

    return userAgents[Math.floor(Math.random() * userAgents.length)]!;
  }

  private extractRightPart(url: string) {
    const lastHttpIndex = url.lastIndexOf('http');
    if (lastHttpIndex !== -1) {
      return url.substring(lastHttpIndex);
    }
    return url;
  }

  private sanitizeAndCheckUrl(params: { imageUrl: string; websiteUrl: string }) {
    let sanitizedImageUrl = params.imageUrl;

    if (sanitizedImageUrl.startsWith('//')) {
      sanitizedImageUrl = `https:${sanitizedImageUrl}`;
    }

    if (sanitizedImageUrl.startsWith('/')) {
      const baseWebsiteUrl = this.baseHostname(params.websiteUrl);
      sanitizedImageUrl = `${baseWebsiteUrl}${sanitizedImageUrl}`;
    }

    sanitizedImageUrl = decodeURIComponent(sanitizedImageUrl);

    return this.extractRightPart(sanitizedImageUrl);
  }

  private hasBotDetection(html: string) {
    const keywords = [
      '<title>Attention Required! | Cloudflare</title>',
      '<p id="cmsg">Please enable JS and disable any ad blocker</p>',
      'To discuss automated access to Amazon data please contact api-services-support@amazon.com.',
    ];
    return keywords.some(keyword => html.includes(keyword));
  }
}

function emptyScanResult(): ScanItemUrlOutput {
  return {
    title: null,
    description: null,
    pictureUrl: null,
    price: null,
    currency: null,
    merchant: null,
  };
}
