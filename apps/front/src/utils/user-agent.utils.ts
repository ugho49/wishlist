import { UAParser } from 'ua-parser-js';

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'unknown';

export type ParsedUserAgent = {
  browser: string;
  browserVersion?: string;
  os: string;
  osVersion?: string;
  deviceType: DeviceType;
  deviceVendor?: string;
  deviceModel?: string;
  cpu?: string;
  engine?: string;
  engineVersion?: string;
  label: string;
  deviceLabel: string;
};

function joinParts(...parts: Array<string | undefined>): string | undefined {
  const value = parts.filter(Boolean).join(' ').trim();
  return value || undefined;
}

function fallbackDeviceLabel(deviceType: DeviceType): string {
  const labels: Record<DeviceType, string> = {
    desktop: 'Ordinateur',
    tablet: 'Tablette',
    mobile: 'Mobile',
    unknown: 'Appareil',
  };
  return labels[deviceType];
}

function deviceTypeFromUa(type?: string): DeviceType {
  if (type === 'mobile') return 'mobile';
  if (type === 'tablet') return 'tablet';
  if (type === 'console' || type === 'smarttv' || type === 'wearable' || type === 'embedded') return 'unknown';
  return type ? 'unknown' : 'desktop';
}

export function parseUserAgent(userAgent?: string | null): ParsedUserAgent {
  if (!userAgent) {
    return {
      browser: 'Navigateur inconnu',
      os: 'Système inconnu',
      deviceType: 'unknown',
      label: 'Appareil inconnu',
      deviceLabel: 'Appareil inconnu',
    };
  }

  const result = UAParser(userAgent);
  const browser = result.browser.name ?? 'Navigateur inconnu';
  const browserVersion = result.browser.version;
  const os = result.os.name ?? 'Système inconnu';
  const osVersion = result.os.version;
  const deviceType = deviceTypeFromUa(result.device.type);
  const deviceVendor = result.device.vendor;
  const deviceModel = result.device.model;
  const cpu = result.cpu.architecture;
  const engine = result.engine.name;
  const engineVersion = result.engine.version;

  const browserLabel = joinParts(browser, browserVersion);
  const osLabel = joinParts(os, osVersion);
  const deviceLabel = joinParts(deviceVendor, deviceModel) ?? fallbackDeviceLabel(deviceType);

  return {
    browser,
    browserVersion,
    os,
    osVersion,
    deviceType,
    deviceVendor,
    deviceModel,
    cpu,
    engine,
    engineVersion,
    label: [browserLabel, osLabel].filter(Boolean).join(' · '),
    deviceLabel,
  };
}
