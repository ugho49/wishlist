import { createCurrentUserFromPayload } from '@wishlist/common';
import { Container, Injectable } from '@znight/core';
import { type CanActivate, type HttpContext } from '@znight/http';

import { CLIENT_IP_SCOPE_TOKEN, CURRENT_USER_SCOPE_TOKEN, setAuthState } from '../auth.context';
import { InvalidTokenError, TokenError, TokenService } from '../token.service';

const BEARER_PREFIX = /^bearer\s+/i;

/**
 * Global HTTP guard: reads the bearer token of every request (REST and the GraphQL endpoint) and
 * stores the authenticated user, or the token error, in the request state. It never denies: the
 * {@link AccessGuard} decides, route by route and field by field.
 */
@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly container: Container,
  ) {}

  async canActivate(ctx: HttpContext): Promise<boolean> {
    const scope = this.container.currentScope();
    scope?.set(CLIENT_IP_SCOPE_TOKEN, ctx.ip);

    const authorization = ctx.header('authorization');
    if (!authorization || !BEARER_PREFIX.test(authorization)) {
      setAuthState(ctx, { error: TokenError.Missing });
      return true;
    }

    try {
      const payload = await this.tokenService.verify(authorization.replace(BEARER_PREFIX, '').trim());
      if (!payload.sid) {
        setAuthState(ctx, { error: 'Invalid token' });
        return true;
      }
      const user = createCurrentUserFromPayload(payload);
      setAuthState(ctx, { user });
      scope?.set(CURRENT_USER_SCOPE_TOKEN, { id: user.id, email: user.email });
    } catch (error) {
      setAuthState(ctx, { error: error instanceof InvalidTokenError ? error.message : TokenError.Invalid });
    }
    return true;
  }
}
