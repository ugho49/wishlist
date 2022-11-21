import { ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.metadata';
import { NEED_ADMIN_PRIVILEGES_KEY } from '../decorators/admin.metadata';
import { ICurrentUser } from '../auth.interface';
import { Authorities } from '@wishlist/common-types';

@Injectable()
export class AuthGuard extends PassportAuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException(info?.name || 'Invalid token');
    }

    const needAdminPrivileges = this.reflector.getAllAndOverride<boolean>(NEED_ADMIN_PRIVILEGES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (needAdminPrivileges) {
      const { authorities } = user as ICurrentUser;
      const isAdmin = authorities.includes(Authorities.ROLE_ADMIN) || authorities.includes(Authorities.ROLE_SUPERADMIN);

      if (!isAdmin) {
        throw new ForbiddenException('Insufficient rights');
      }
    }

    return user;
  }
}
