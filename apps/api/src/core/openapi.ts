import { OpenApiDocument, securityScheme } from '@znight/openapi';

import { Public } from '../auth/infrastructure/decorators/public.metadata';

/** The JWT access token of the `login` mutation, sent as `Authorization: Bearer <token>`. */
export const JwtAuth = securityScheme('JWT-Auth', { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' });

/**
 * Wishlist
 *
 * The Wishlist API: the remaining REST routes (multipart uploads and health). Everything else is GraphQL.
 */
@OpenApiDocument({
  info: { title: 'Wishlist', version: '1.0.0' },
  security: [JwtAuth],
  decisions: [{ when: Public, security: [] }],
})
export class WishlistApi {}
