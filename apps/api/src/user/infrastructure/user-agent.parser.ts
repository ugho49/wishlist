import { UAParser } from 'ua-parser-js';

import { UNKNOWN_SESSION_DEVICE, UserSessionDeviceType } from '../domain/user-session-device-type.enum';

export type ParsedSessionDevice = {
  browser: string;
  browserVersion?: string;
  os: string;
  osVersion?: string;
  type: UserSessionDeviceType;
  vendor?: string;
  model?: string;
  label: string;
};

function joinParts(...parts: Array<string | undefined>): string | undefined {
  const value = parts.filter(Boolean).join(' ').trim();
  return value || undefined;
}

function fallbackDeviceLabel(type: UserSessionDeviceType): string {
  const labels: Record<UserSessionDeviceType, string> = {
    [UserSessionDeviceType.DESKTOP]: 'Ordinateur',
    [UserSessionDeviceType.TABLET]: 'Tablette',
    [UserSessionDeviceType.MOBILE]: 'Mobile',
    [UserSessionDeviceType.UNKNOWN]: 'Appareil',
  };
  return labels[type];
}

function deviceTypeFromUa(type?: string): UserSessionDeviceType {
  if (type === 'mobile') return UserSessionDeviceType.MOBILE;
  if (type === 'tablet') return UserSessionDeviceType.TABLET;
  if (type === 'console' || type === 'smarttv' || type === 'wearable' || type === 'embedded') {
    return UserSessionDeviceType.UNKNOWN;
  }
  return type ? UserSessionDeviceType.UNKNOWN : UserSessionDeviceType.DESKTOP;
}

export function parseUserAgent(userAgent?: string | null): ParsedSessionDevice {
  if (!userAgent) {
    return { ...UNKNOWN_SESSION_DEVICE };
  }

  const result = UAParser(userAgent);
  const browser = result.browser.name ?? UNKNOWN_SESSION_DEVICE.browser;
  const browserVersion = result.browser.version;
  const os = result.os.name ?? UNKNOWN_SESSION_DEVICE.os;
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
