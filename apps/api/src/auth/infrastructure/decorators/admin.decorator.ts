import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { Authorities } from '../../../user/domain/authorities.enum';
import { AuthorityGuard } from '../guards/authority.guard';
import { HasAuthoritiesMetadataKey, type HasAuthoritiesMetadataParamType } from './authority.metadata';

export function IsAdmin() {
  return applyDecorators(
    SetMetadata<string, HasAuthoritiesMetadataParamType>(HasAuthoritiesMetadataKey, {
      authorities: [Authorities.ROLE_SUPERADMIN, Authorities.ROLE_ADMIN],
      condition: 'OR',
    }),
    UseGuards(AuthorityGuard),
    ApiExcludeController(),
  );
}
