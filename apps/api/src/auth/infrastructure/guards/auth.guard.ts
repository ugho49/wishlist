import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport'
import { Observability } from '@wishlist/api/core'

import { IS_PUBLIC_KEY } from '../decorators/public.metadata'

@Injectable()
export class AuthGuard extends PassportAuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super()
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException(info?.name || 'Invalid token')
    }

    const observability = new Observability(context.switchToHttp().getResponse())
    observability.setContext({ currentUser: user })

    return user
  }
}
