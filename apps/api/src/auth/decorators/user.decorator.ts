import type { ExecutionContext } from '@nestjs/common'
import type { ICurrentUser } from '@wishlist/common'

import { createParamDecorator } from '@nestjs/common'

export const CurrentUser = createParamDecorator((data: keyof ICurrentUser, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  const user = request.user as ICurrentUser
  return data ? user?.[data] : user
})
