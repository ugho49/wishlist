import type { UserId, UserRefreshTokenId } from '@wishlist/common';

export type UserRefreshTokenProps = {
  id: UserRefreshTokenId;
  userId: UserId;
  tokenHash: string;
  userAgent?: string;
  ip?: string;
  createdAt: Date;
  lastUsedAt: Date;
  expiresAt: Date;
  revokedAt?: Date;
};

export class UserRefreshToken {
  public readonly id: UserRefreshTokenId;
  public readonly userId: UserId;
  public readonly tokenHash: string;
  public readonly userAgent?: string;
  public readonly ip?: string;
  public readonly createdAt: Date;
  public readonly lastUsedAt: Date;
  public readonly expiresAt: Date;
  public readonly revokedAt?: Date;

  constructor(props: UserRefreshTokenProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.tokenHash = props.tokenHash;
    this.userAgent = props.userAgent;
    this.ip = props.ip;
    this.createdAt = props.createdAt;
    this.lastUsedAt = props.lastUsedAt;
    this.expiresAt = props.expiresAt;
    this.revokedAt = props.revokedAt;
  }

  static create(params: {
    id: UserRefreshTokenId;
    userId: UserId;
    tokenHash: string;
    userAgent?: string;
    ip?: string;
    expiresAt: Date;
  }): UserRefreshToken {
    const now = new Date();
    return new UserRefreshToken({
      id: params.id,
      userId: params.userId,
      tokenHash: params.tokenHash,
      userAgent: params.userAgent,
      ip: params.ip,
      createdAt: now,
      lastUsedAt: now,
      expiresAt: params.expiresAt,
    });
  }

  isActive(now = new Date()): boolean {
    return this.revokedAt === undefined && this.expiresAt > now;
  }

  touch(params: { ip?: string; userAgent?: string }): UserRefreshToken {
    return new UserRefreshToken({
      ...this,
      ip: params.ip ?? this.ip,
      userAgent: params.userAgent ?? this.userAgent,
      lastUsedAt: new Date(),
    });
  }

  revoke(): UserRefreshToken {
    if (this.revokedAt) return this;
    return new UserRefreshToken({
      ...this,
      revokedAt: new Date(),
    });
  }
}
