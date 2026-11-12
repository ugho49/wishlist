import type { ICurrentUser, UserId } from '@wishlist/common';

import { createParamDecorator } from '@znight/core';

import { requireCurrentUser } from '../auth.context';

/**
 * The authenticated user, on REST routes and GraphQL fields.
 * @example
 * ```typescript
 * @Query()
 * me(@CurrentUser() user: ICurrentUser) {
 *   return "hello " + user.email
 * }
 * ```
 */
export const CurrentUser = createParamDecorator<ICurrentUser>({
  http: ctx => requireCurrentUser(ctx),
  graphql: ctx => requireCurrentUser(ctx.http),
});

/** The id of the authenticated user. */
export const CurrentUserId = createParamDecorator<UserId>({
  http: ctx => requireCurrentUser(ctx).id,
  graphql: ctx => requireCurrentUser(ctx.http).id,
});
