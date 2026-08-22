import type { Authorities } from '@wishlist/common';

export const HasAuthoritiesMetadataKey = 'has_authorities';

export type HasAuthoritiesMetadataParamType = {
  authorities: Authorities[];
  condition?: 'OR' | 'AND';
};
