import type { UserId, UserSessionId } from '@wishlist/common';

import { uuid } from '@wishlist/common';

import { type User } from '../../src/user/domain/model/user.model';
import { UserSession } from '../../src/user/domain/model/user-session.model';

type UserSessionBuilderData = {
  user?: User;
  tokenHash: string;
  userAgent?: string;
  ip?: string;
  expiresAt: Date;
  revokedAt?: Date;
};

export class UserSessionBuilder {
  private readonly data: UserSessionBuilderData = {
    tokenHash: 'a'.repeat(64),
    ip: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  };

  withUser(user: User): this {
    this.data.user = user;
    return this;
  }

  withTokenHash(tokenHash: string): this {
    this.data.tokenHash = tokenHash;
    return this;
  }

  withIp(ip: string): this {
    this.data.ip = ip;
    return this;
  }

  withUserAgent(userAgent: string): this {
    this.data.userAgent = userAgent;
    return this;
  }

  expiresAt(expiresAt: Date): this {
    this.data.expiresAt = expiresAt;
    return this;
  }

  expired(): this {
    this.data.expiresAt = new Date(Date.now() - 1000);
    return this;
  }

  revoked(): this {
    this.data.revokedAt = new Date();
    return this;
  }

  build(user?: User): UserSession {
    const sessionUser = user ?? this.data.user;
    if (!sessionUser) {
      throw new Error('UserSessionBuilder requires a user');
    }

    const session = UserSession.create({
      id: uuid() as UserSessionId,
      userId: sessionUser.id as UserId,
      tokenHash: this.data.tokenHash,
      userAgent: this.data.userAgent,
      ip: this.data.ip,
      expiresAt: this.data.expiresAt,
    });

    if (!this.data.revokedAt) return session;

    return session.revoke();
  }
}
