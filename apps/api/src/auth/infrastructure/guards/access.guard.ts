import type { GraphQLGuard, ResolverContext } from '@znight/graphql';

import { Injectable } from '@znight/core';
import { type CanActivate, ForbiddenException, type HttpContext, type RouteMetaCarrier } from '@znight/http';

import { requireCurrentUser } from '../auth.context';
import { IsAdmin } from '../decorators/admin.decorator';
import { Authenticated, Public } from '../decorators/public.metadata';

/**
 * Enforces the "access" route decisions on REST routes and GraphQL root fields (default deny):
 * `@Public()` is open, `@Authenticated()` needs a valid token, `@IsAdmin()` an admin token.
 */
@Injectable()
export class AccessGuard implements CanActivate, GraphQLGuard {
  static readonly enforces = [Public, Authenticated, IsAdmin];

  canActivate(ctx: HttpContext): boolean {
    return this.decide(ctx, ctx);
  }

  canResolve(ctx: ResolverContext): boolean {
    return this.decide(ctx, ctx.http);
  }

  private decide(carrier: RouteMetaCarrier, http: HttpContext | undefined): boolean {
    if (Public.get(carrier) === true) return true;

    const user = requireCurrentUser(http);

    if (IsAdmin.get(carrier) === true) {
      if (!user.isAdmin) throw new ForbiddenException('Insufficient rights');
      return true;
    }

    return Authenticated.get(carrier) === true;
  }
}
