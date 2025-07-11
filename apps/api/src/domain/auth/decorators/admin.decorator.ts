import type { HasAuthoritiesMetadataParamType } from './authority.decorator'

import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common'
import { ApiExcludeController } from '@nestjs/swagger'
import { Authorities } from '@wishlist/common'

import { AuthorityGuard } from '../guards/authority.guard'
import { HasAuthoritiesMetadataKey } from './authority.decorator'

export function IsAdmin() {
  return applyDecorators(
    SetMetadata<string, HasAuthoritiesMetadataParamType>(HasAuthoritiesMetadataKey, {
      authorities: [Authorities.ROLE_SUPERADMIN, Authorities.ROLE_ADMIN],
      condition: 'OR',
    }),
    UseGuards(AuthorityGuard),
    ApiExcludeController(),
  )
}
