import { match, P } from 'ts-pattern';
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
  return match(type)
    .with(UserSessionDeviceType.DESKTOP, () => 'Ordinateur')
    .with(UserSessionDeviceType.TABLET, () => 'Tablette')
    .with(UserSessionDeviceType.MOBILE, () => 'Mobile')
    .with(UserSessionDeviceType.UNKNOWN, () => 'Appareil')
    .exhaustive();
}

function deviceTypeFromUa(type?: string): UserSessionDeviceType {
  return match(type)
    .with('mobile', () => UserSessionDeviceType.MOBILE)
    .with('tablet', () => UserSessionDeviceType.TABLET)
    .with(P.nullish, () => UserSessionDeviceType.DESKTOP)
    .otherwise(() => UserSessionDeviceType.UNKNOWN);
}

export function parseUserAgent(userAgent?: string | null): ParsedSessionDevice {
  return match(userAgent)
    .with(P.nullish, '', () => ({ ...UNKNOWN_SESSION_DEVICE }))
    .otherwise(ua => {
      const result = UAParser(ua);
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
    });
}
