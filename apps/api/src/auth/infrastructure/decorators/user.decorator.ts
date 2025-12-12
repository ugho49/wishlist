import type { ExecutionContext } from '@nestjs/common'
import type { ICurrentUser } from '@wishlist/common'

import { createParamDecorator } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

/**
 * REST decorator to get the current authenticated user
 * @example
 * ```typescript
 * @Get('/me')
 * getMe(@CurrentUser() user: ICurrentUser) {
 *   return "hello " + user.email
 * }
 * ```
 */
export const CurrentUser = createParamDecorator((data: keyof ICurrentUser, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  const user = request.user as ICurrentUser
  return data ? user?.[data] : user
})

/**
 * GraphQL decorator to get the current authenticated user
 * @example
 * ```typescript
 * @Query(() => String)
 * me(@GqlCurrentUser() user: ICurrentUser) {
 *   return "hello " + user.email
 * }
 * ```
 */
export const GqlCurrentUser = createParamDecorator((data: keyof ICurrentUser, context: ExecutionContext) => {
  const ctx = GqlExecutionContext.create(context)
  const user = ctx.getContext().req.user as ICurrentUser
  return data ? user?.[data] : user
})
