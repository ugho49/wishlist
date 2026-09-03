export enum UserSessionDeviceType {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop',
  UNKNOWN = 'unknown',
}

export const UNKNOWN_SESSION_DEVICE = {
  browser: 'Navigateur inconnu',
  os: 'Système inconnu',
  type: UserSessionDeviceType.UNKNOWN,
  label: 'Appareil inconnu',
} as const;
