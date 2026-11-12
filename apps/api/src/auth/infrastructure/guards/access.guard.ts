import type { ICurrentUser } from '@wishlist/common';
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
    return this.decide(ctx, () => requireCurrentUser(ctx));
  }

  canResolve(ctx: ResolverContext): boolean {
    return this.decide(ctx, () => requireCurrentUser(ctx.http));
  }

  /**
   * `route` carries the decisions (a REST route or a GraphQL root field); `currentUser` reads the user of
   * the request and throws a 401 without a valid token, called only when the route is not public.
   */
  private decide(route: RouteMetaCarrier, currentUser: () => ICurrentUser): boolean {
    if (Public.get(route) === true) return true;

    const user = currentUser();

    if (IsAdmin.get(route) === true) {
      if (!user.isAdmin) throw new ForbiddenException('Insufficient rights');
      return true;
    }

    return Authenticated.get(route) === true;
  }
}
