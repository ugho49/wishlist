import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ICurrentUser } from '../auth.interface';
import { HasAuthoritiesMetadataKey, HasAuthoritiesMetadataParamType } from '../decorators/authority.decorator';

@Injectable()
export class AuthorityGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { authorities, condition } = this.reflector.getAllAndOverride<HasAuthoritiesMetadataParamType>(
      HasAuthoritiesMetadataKey,
      [context.getHandler(), context.getClass()]
    );
    const request = context.switchToHttp().getRequest();
    const user = request.user as ICurrentUser;

    if (condition === 'AND') {
      for (const authority of authorities) {
        if (!user.authorities.includes(authority)) {
          throw new ForbiddenException('Insufficient rights');
        }
      }
    }

    if (condition === 'OR') {
      const someMatch = authorities.some((authority) => user.authorities.includes(authority));
      if (!someMatch) {
        throw new ForbiddenException('Insufficient rights');
      }
    }

    return true;
  }
}
