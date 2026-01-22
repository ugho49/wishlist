import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { GqlExecutionContext } from '@nestjs/graphql'
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport'
import { Observability } from '@wishlist/api/core'

import { IS_PUBLIC_KEY } from '../decorators/public.metadata'

@Injectable()
export class AuthGuard extends PassportAuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super()
  }

  override getRequest(context: ExecutionContext) {
    // Support both REST and GraphQL contexts
    const contextType = context.getType<'http' | 'graphql'>()

    if (contextType === 'graphql') {
      const ctx = GqlExecutionContext.create(context)
      return ctx.getContext().req
    }

    return context.switchToHttp().getRequest()
  }

  override canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) {
      return true
    }

    return super.canActivate(context)
  }

  // biome-ignore lint/suspicious/noExplicitAny: it's an override
  override handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException(info?.name || 'Invalid token')
    }

    const contextType = context.getType<'http' | 'graphql'>()

    // Only set observability for HTTP requests (not GraphQL)
    if (contextType === 'http') {
      const observability = new Observability(context.switchToHttp().getResponse())
      observability.setContext({ currentUser: user })
    }

    return user
  }
}
