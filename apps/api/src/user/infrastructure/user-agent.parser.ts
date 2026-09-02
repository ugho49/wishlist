import { UAParser } from 'ua-parser-js';

export type SessionDeviceType = 'mobile' | 'tablet' | 'desktop' | 'unknown';

export type ParsedSessionDevice = {
  browser: string;
  browserVersion?: string;
  os: string;
  osVersion?: string;
  type: SessionDeviceType;
  vendor?: string;
  model?: string;
  label: string;
};

function joinParts(...parts: Array<string | undefined>): string | undefined {
  const value = parts.filter(Boolean).join(' ').trim();
  return value || undefined;
}

function fallbackDeviceLabel(type: SessionDeviceType): string {
  const labels: Record<SessionDeviceType, string> = {
    desktop: 'Ordinateur',
    tablet: 'Tablette',
    mobile: 'Mobile',
    unknown: 'Appareil',
  };
  return labels[type];
}

function deviceTypeFromUa(type?: string): SessionDeviceType {
  if (type === 'mobile') return 'mobile';
  if (type === 'tablet') return 'tablet';
  if (type === 'console' || type === 'smarttv' || type === 'wearable' || type === 'embedded') return 'unknown';
  return type ? 'unknown' : 'desktop';
}

export function parseUserAgent(userAgent?: string | null): ParsedSessionDevice {
  if (!userAgent) {
    return {
      browser: 'Navigateur inconnu',
      os: 'Système inconnu',
      type: 'unknown',
      label: 'Appareil inconnu',
    };
  }

  const result = UAParser(userAgent);
  const browser = result.browser.name ?? 'Navigateur inconnu';
  const browserVersion = result.browser.version;
  const os = result.os.name ?? 'Système inconnu';
  const osVersion = result.os.version;
  const type = deviceTypeFromUa(result.device.type);
  const vendor = result.device.vendor;
  const model = result.device.model;

  return {
    browser,
    browserVersion,
    os,
    osVersion,
    type,
    vendor,
    model,
    label: joinParts(vendor, model) ?? fallbackDeviceLabel(type),
  };
}
