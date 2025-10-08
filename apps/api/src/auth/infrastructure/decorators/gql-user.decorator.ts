import type { ExecutionContext } from '@nestjs/common'
import type { ICurrentUser } from '@wishlist/common'

import { createParamDecorator } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

export const CurrentGqlUser = createParamDecorator((data: keyof ICurrentUser, ctx: ExecutionContext) => {
  const gqlCtx = GqlExecutionContext.create(ctx)
  const request = gqlCtx.getContext().req
  const user = request.user as ICurrentUser
  return data ? user?.[data] : user
})
