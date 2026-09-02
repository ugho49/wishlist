import { parseUserAgent } from './user-agent.parser';
import { describe, expect, it } from 'bun:test';

const CHROME_MAC =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1';
const CHROME_LINUX =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

describe('parseUserAgent', () => {
  it('should return an unknown device when the user agent is missing', () => {
    expect(parseUserAgent(undefined)).toEqual({
      browser: 'Navigateur inconnu',
      os: 'Système inconnu',
      type: 'unknown',
      label: 'Appareil inconnu',
    });
  });

  it('should extract browser, OS and desktop device from a Chrome Mac UA', () => {
    const parsed = parseUserAgent(CHROME_MAC);

    expect(parsed.browser).toBe('Chrome');
    expect(parsed.os).toBe('macOS');
    expect(parsed.type).toBe('desktop');
    expect(parsed.label).toBe('Apple Macintosh');
    expect(parsed.vendor).toBe('Apple');
    expect(parsed.model).toBe('Macintosh');
  });

  it('should extract Linux as a desktop OS', () => {
    const parsed = parseUserAgent(CHROME_LINUX);

    expect(parsed.os).toBe('Linux');
    expect(parsed.type).toBe('desktop');
  });

  it('should extract an iPhone as a mobile device', () => {
    const parsed = parseUserAgent(IPHONE);

    expect(parsed.type).toBe('mobile');
    expect(parsed.os).toBe('iOS');
    expect(parsed.vendor).toBe('Apple');
    expect(parsed.model).toBe('iPhone');
    expect(parsed.label).toContain('iPhone');
  });
});
