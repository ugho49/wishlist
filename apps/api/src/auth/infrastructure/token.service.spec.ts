import type { UserId, UserSessionId } from '@wishlist/common';
import type { AuthConfig } from './auth.config';

import { uuid } from '@wishlist/common';

import { TokenError, TokenService } from './token.service';
import { describe, expect, it } from 'bun:test';

describe('TokenService', () => {
  const config = {
    issuer: 'test',
    accessTokenSecret: 'test-secret',
    accessTokenDuration: '15m',
    accessTokenAlgorithm: 'HS512',
  } as AuthConfig;
  const service = new TokenService(config);

  const payload = {
    sub: uuid() as UserId,
    email: 'session@test.fr',
    authorities: ['ROLE_USER'],
    sid: uuid() as UserSessionId,
  };

  it('should verify a token it signed', async () => {
    const token = await service.sign(payload);

    expect(await service.verify(token)).toMatchObject({ ...payload, iss: 'test' });
  });

  it('should reject a token signed with another secret', async () => {
    const token = await new TokenService({ ...config, accessTokenSecret: 'other' } as AuthConfig).sign(payload);

    await expect(service.verify(token)).rejects.toThrow(TokenError.Invalid);
  });

  it('should reject an expired token', async () => {
    const token = await new TokenService({ ...config, accessTokenDuration: '-1s' } as AuthConfig).sign(payload);

    await expect(service.verify(token)).rejects.toThrow(TokenError.Expired);
  });
});
