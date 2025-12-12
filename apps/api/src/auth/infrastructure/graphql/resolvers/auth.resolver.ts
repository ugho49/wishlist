import { CommandBus } from '@nestjs/cqrs'
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql'

import { LoginCommand, LoginWithGoogleCommand } from '../../../domain'
import { authGraphQLMapper } from '../mappers'
import { LoginInput, LoginResultObject, LoginWithGoogleInput } from '../types'

@Resolver()
export class AuthResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @Mutation(() => LoginResultObject, { name: 'login', description: 'Login with email and password' })
  async login(
    @Args('input') input: LoginInput,
    @Context() context: { req: { ip: string } },
  ): Promise<LoginResultObject> {
    const result = await this.commandBus.execute(
      new LoginCommand({
        email: input.email.toLowerCase(),
        password: input.password,
        ip: context.req.ip,
      }),
    )
    return authGraphQLMapper.toLoginResultObject(result)
  }

  @Mutation(() => LoginResultObject, { name: 'loginWithGoogle', description: 'Login or register with Google OAuth' })
  async loginWithGoogle(
    @Args('input') input: LoginWithGoogleInput,
    @Context() context: { req: { ip: string } },
  ): Promise<LoginResultObject> {
    const result = await this.commandBus.execute(
      new LoginWithGoogleCommand({
        code: input.code,
        ip: context.req.ip,
        createUserIfNotExists: input.createUserIfNotExists,
      }),
    )
    return authGraphQLMapper.toLoginResultObject(result)
  }
}
