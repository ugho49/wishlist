import type { UserId, UserSessionId } from '@wishlist/common';

import { parseUserAgent } from '../../infrastructure/user-agent.parser';
import { UNKNOWN_SESSION_DEVICE, UserSessionDeviceType } from '../user-session-device-type.enum';

export type UserSessionProps = {
  id: UserSessionId;
  userId: UserId;
  tokenHash: string;
  userAgent?: string;
  browser: string;
  browserVersion?: string;
  os: string;
  osVersion?: string;
  deviceType: UserSessionDeviceType;
  vendor?: string;
  model?: string;
  label: string;
  ip?: string;
  createdAt: Date;
  lastUsedAt: Date;
  expiresAt: Date;
  revokedAt?: Date;
};

export class UserSession {
  public readonly id: UserSessionId;
  public readonly userId: UserId;
  public readonly tokenHash: string;
  public readonly userAgent?: string;
  public readonly browser: string;
  public readonly browserVersion?: string;
  public readonly os: string;
  public readonly osVersion?: string;
  public readonly deviceType: UserSessionDeviceType;
  public readonly vendor?: string;
  public readonly model?: string;
  public readonly label: string;
  public readonly ip?: string;
  public readonly createdAt: Date;
  public readonly lastUsedAt: Date;
  public readonly expiresAt: Date;
  public readonly revokedAt?: Date;

  constructor(props: UserSessionProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.tokenHash = props.tokenHash;
    this.userAgent = props.userAgent;
    this.browser = props.browser;
    this.browserVersion = props.browserVersion;
    this.os = props.os;
    this.osVersion = props.osVersion;
    this.deviceType = props.deviceType;
    this.vendor = props.vendor;
    this.model = props.model;
    this.label = props.label;
    this.ip = props.ip;
    this.createdAt = props.createdAt;
    this.lastUsedAt = props.lastUsedAt;
    this.expiresAt = props.expiresAt;
    this.revokedAt = props.revokedAt;
  }

  static create(params: {
    id: UserSessionId;
    userId: UserId;
    tokenHash: string;
    userAgent?: string;
    ip?: string;
    expiresAt: Date;
  }): UserSession {
    const now = new Date();
    const device = parseUserAgent(params.userAgent);
    return new UserSession({
      id: params.id,
      userId: params.userId,
      tokenHash: params.tokenHash,
      userAgent: params.userAgent,
      browser: device.browser,
      browserVersion: device.browserVersion,
      os: device.os,
      osVersion: device.osVersion,
      deviceType: device.type,
      vendor: device.vendor,
      model: device.model,
      label: device.label,
      ip: params.ip,
      createdAt: now,
      lastUsedAt: now,
      expiresAt: params.expiresAt,
    });
  }

  isActive(now = new Date()): boolean {
    return this.revokedAt === undefined && this.expiresAt > now;
  }

  needsDeviceBackfill(): boolean {
    return this.userAgent !== undefined && this.browser === UNKNOWN_SESSION_DEVICE.browser;
  }

  withParsedDevice(): UserSession {
    const device = parseUserAgent(this.userAgent);
    return new UserSession({
      ...this,
      browser: device.browser,
      browserVersion: device.browserVersion,
      os: device.os,
      osVersion: device.osVersion,
      deviceType: device.type,
      vendor: device.vendor,
      model: device.model,
      label: device.label,
    });
  }

  touch(params: { ip?: string }): UserSession {
    return new UserSession({
      ...this,
      ip: params.ip ?? this.ip,
      lastUsedAt: new Date(),
    });
  }

  rotate(params: { tokenHash: string; expiresAt: Date; ip?: string }): UserSession {
    return new UserSession({
      ...this,
      tokenHash: params.tokenHash,
      ip: params.ip ?? this.ip,
      lastUsedAt: new Date(),
      expiresAt: params.expiresAt,
    });
  }

  revoke(): UserSession {
    if (this.revokedAt) return this;
    return new UserSession({
      ...this,
      revokedAt: new Date(),
    });
  }
}
