import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { GqlExecutionContext } from '@nestjs/graphql'
import { ICurrentUser } from '@wishlist/common'

import { HasAuthoritiesMetadataKey, HasAuthoritiesMetadataParamType } from '../decorators/authority.decorator'

@Injectable()
export class AuthorityGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const { authorities, condition } = this.reflector.getAllAndOverride<HasAuthoritiesMetadataParamType>(
      HasAuthoritiesMetadataKey,
      [context.getHandler(), context.getClass()],
    )

    // Support both REST and GraphQL contexts
    const contextType = context.getType<'http' | 'graphql'>()
    let user: ICurrentUser

    if (contextType === 'graphql') {
      const ctx = GqlExecutionContext.create(context)
      user = ctx.getContext().req.user as ICurrentUser
    } else {
      const request = context.switchToHttp().getRequest()
      user = request.user as ICurrentUser
    }

    if (condition === 'AND') {
      for (const authority of authorities) {
        if (!user.authorities.includes(authority)) {
          throw new ForbiddenException('Insufficient rights')
        }
      }
    }

    if (condition === 'OR') {
      const someMatch = authorities.some(authority => user.authorities.includes(authority))
      if (!someMatch) {
        throw new ForbiddenException('Insufficient rights')
      }
    }

    return true
  }
}
