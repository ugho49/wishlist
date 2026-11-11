import type { ICurrentUser } from '@wishlist/common';

import { type HttpContext, UnauthorizedException } from '@znight/http';

const AUTH_STATE_KEY = 'auth';

/** What the {@link AuthenticationGuard} found on the request: a user, or why there is none. */
export type AuthState = { readonly user: ICurrentUser } | { readonly error: string };

/** Scope token of the current user, read by the logger (`scopeFields`). */
export const CURRENT_USER_SCOPE_TOKEN = 'wishlist#currentUser';
/** Scope token of the client IP, read by the logger (`scopeFields`). */
export const CLIENT_IP_SCOPE_TOKEN = 'wishlist#ip';

export function setAuthState(ctx: HttpContext, state: AuthState): void {
  ctx.state.set(AUTH_STATE_KEY, state);
}

/** The authenticated user of the request, if any. */
export function findCurrentUser(ctx: HttpContext | undefined): ICurrentUser | undefined {
  const state = ctx?.state.get(AUTH_STATE_KEY) as AuthState | undefined;
  return state !== undefined && 'user' in state ? state.user : undefined;
}

/** The authenticated user of the request; an `UnauthorizedException` (with the token error) otherwise. */
export function requireCurrentUser(ctx: HttpContext | undefined): ICurrentUser {
  const state = ctx?.state.get(AUTH_STATE_KEY) as AuthState | undefined;
  if (state !== undefined && 'user' in state) return state.user;
  throw new UnauthorizedException(state?.error ?? 'Invalid token');
}
