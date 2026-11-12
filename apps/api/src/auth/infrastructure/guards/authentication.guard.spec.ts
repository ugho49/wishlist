import type { Container } from '@znight/core';
import type { HttpContext } from '@znight/http';
import type { AuthConfig } from '../auth.config';

import { type UserId, type UserSessionId, uuid } from '@wishlist/common';

import { findCurrentUser, requireCurrentUser } from '../auth.context';
import { TokenError, TokenService } from '../token.service';
import { AuthenticationGuard } from './authentication.guard';
import { describe, expect, it } from 'bun:test';

describe('AuthenticationGuard', () => {
  const tokenService = new TokenService({
    issuer: 'test',
    accessTokenSecret: 'test-secret',
    accessTokenDuration: '15m',
    accessTokenAlgorithm: 'HS512',
  } as AuthConfig);
  const container = { currentScope: () => undefined } as unknown as Container;
  const guard = new AuthenticationGuard(tokenService, container);

  const userId = uuid() as UserId;
  const sessionId = uuid() as UserSessionId;

  const contextWith = (authorization?: string) => {
    const state = new Map<string, unknown>();
    return {
      state,
      ip: '127.0.0.1',
      header: (name: string) => (name === 'authorization' ? authorization : undefined),
    } as unknown as HttpContext;
  };

  it('should store the error when there is no token', async () => {
    const ctx = contextWith();

    expect(await guard.canActivate(ctx)).toBe(true);
    expect(() => requireCurrentUser(ctx)).toThrow(TokenError.Missing);
  });

  it('should reject a payload without sid', async () => {
    const token = await tokenService.sign({ sub: userId, email: 'legacy@test.fr', authorities: ['ROLE_USER'] });
    const ctx = contextWith(`Bearer ${token}`);

    expect(await guard.canActivate(ctx)).toBe(true);
    expect(findCurrentUser(ctx)).toBeUndefined();
    expect(() => requireCurrentUser(ctx)).toThrow('Invalid token');
  });

  it('should map a payload with sid to the current user', async () => {
    const token = await tokenService.sign({
      sub: userId,
      email: 'session@test.fr',
      authorities: ['ROLE_USER'],
      sid: sessionId,
    });
    const ctx = contextWith(`Bearer ${token}`);

    await guard.canActivate(ctx);

    expect(requireCurrentUser(ctx)).toMatchObject({ id: userId, email: 'session@test.fr', sessionId });
  });
});
