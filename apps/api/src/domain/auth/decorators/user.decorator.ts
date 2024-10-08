import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { ICurrentUser } from '@wishlist/common-types'

export const CurrentUser = createParamDecorator((data: keyof ICurrentUser, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  const user = request.user as ICurrentUser
  return data ? user?.[data] : user
})
