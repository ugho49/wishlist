import type { Authorities } from '../../../user/domain/authorities.enum';

export const HasAuthoritiesMetadataKey = 'has_authorities';

export type HasAuthoritiesMetadataParamType = {
  authorities: Authorities[];
  condition?: 'OR' | 'AND';
};
