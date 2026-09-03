import type { ConfigType } from '@nestjs/config';
import type { UserId, UserSessionId } from '@wishlist/common';

import { UnauthorizedException } from '@nestjs/common';
import { uuid } from '@wishlist/common';

import authConfig from '../auth.config';
import { JwtStrategy } from './jwt.strategy';
import { describe, expect, it } from 'bun:test';

describe('JwtStrategy', () => {
  const strategy = new JwtStrategy({
    issuer: 'test',
    accessToken: {
      secret: 'test-secret',
      duration: '15m',
      algorithm: 'HS512',
    },
    refreshToken: { duration: '30d' },
    social: { google: { clientId: 'id', clientSecret: 'secret' } },
  } as ConfigType<typeof authConfig>);

  const userId = uuid() as UserId;
  const sessionId = uuid() as UserSessionId;

  it('should reject a payload without sid', () => {
    expect(() =>
      strategy.validate({
        sub: userId,
        email: 'legacy@test.fr',
        authorities: ['ROLE_USER'],
      }),
    ).toThrow(UnauthorizedException);
  });

  it('should map a payload with sid to the current user', () => {
    const user = strategy.validate({
      sub: userId,
      email: 'session@test.fr',
      authorities: ['ROLE_USER'],
      sid: sessionId,
    });

    expect(user).toMatchObject({
      id: userId,
      email: 'session@test.fr',
      sessionId,
    });
  });
});
