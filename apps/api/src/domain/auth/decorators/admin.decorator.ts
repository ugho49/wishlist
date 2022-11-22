import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthorityGuard } from '../guards/authority.guard';
import { HasAuthoritiesMetadataKey, HasAuthoritiesMetadataParamType } from './authority.decorator';
import { Authorities } from '@wishlist/common-types';
import { ApiExcludeController } from '@nestjs/swagger';

export function IsAdmin() {
  return applyDecorators(
    SetMetadata<string, HasAuthoritiesMetadataParamType>(HasAuthoritiesMetadataKey, {
      authorities: [Authorities.ROLE_SUPERADMIN, Authorities.ROLE_ADMIN],
      condition: 'OR',
    }),
    UseGuards(AuthorityGuard),
    ApiExcludeController()
  );
}
