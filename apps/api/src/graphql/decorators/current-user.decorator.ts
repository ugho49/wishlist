import type { ExecutionContext } from '@nestjs/common'
import type { ICurrentUser } from '@wishlist/common'

import { createParamDecorator } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

export const GqlCurrentUser = createParamDecorator((data: keyof ICurrentUser, context: ExecutionContext) => {
  const ctx = GqlExecutionContext.create(context)
  const user = ctx.getContext().req.user as ICurrentUser
  return data ? user?.[data] : user
})
