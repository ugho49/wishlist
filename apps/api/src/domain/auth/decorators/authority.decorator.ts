import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common'
import { Authorities } from '@wishlist/common-types'

import { AuthorityGuard } from '../guards/authority.guard.js'

export const HasAuthoritiesMetadataKey = 'has_authorities'

export type HasAuthoritiesMetadataParamType = {
  authorities: Authorities[]
  condition?: 'OR' | 'AND'
}

export function HasAuthorities({ authorities, condition = 'OR' }: HasAuthoritiesMetadataParamType) {
  return applyDecorators(
    SetMetadata<string, HasAuthoritiesMetadataParamType>(HasAuthoritiesMetadataKey, { authorities, condition }),
    UseGuards(AuthorityGuard),
  )
}
