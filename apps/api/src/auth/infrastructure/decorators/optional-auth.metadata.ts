import { SetMetadata } from '@nestjs/common';

export const IS_OPTIONAL_AUTH_KEY = 'isOptionalAuth';

export function OptionalAuth() {
  return SetMetadata(IS_OPTIONAL_AUTH_KEY, true);
}
