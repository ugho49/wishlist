import { createRouteDecorator } from '@znight/http';

/**
 * Route decisions of the "access" group. Every route and every GraphQL root field must take one
 * (checked at build time, ZNIGHT023), and the {@link AccessGuard} enforces them.
 */

/** Open to everyone, without a token. */
export const Public = createRouteDecorator('public', { group: 'access', required: true });

/** Needs a valid access token (the default of every resolver and controller class). */
export const Authenticated = createRouteDecorator('authenticated', { group: 'access', required: true });
