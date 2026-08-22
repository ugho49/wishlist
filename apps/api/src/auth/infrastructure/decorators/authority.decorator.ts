import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';

import { AuthorityGuard } from '../guards/authority.guard';
import { HasAuthoritiesMetadataKey, type HasAuthoritiesMetadataParamType } from './authority.metadata';

export function HasAuthorities({ authorities, condition = 'OR' }: HasAuthoritiesMetadataParamType) {
  return applyDecorators(
    SetMetadata<string, HasAuthoritiesMetadataParamType>(HasAuthoritiesMetadataKey, { authorities, condition }),
    UseGuards(AuthorityGuard),
  );
}
