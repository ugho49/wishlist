import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { ZodPipe } from '@wishlist/api/core'
import { RealIP } from 'nestjs-real-ip'

import { LoginInput, LoginResult, LoginWithGoogleInput, LoginWithGoogleResult } from '../../gql/generated-types'
import { LoginUseCase } from '../application/commands/login.use-case'
import { LoginWithGoogleUseCase } from '../application/commands/login-with-google.use-case'
import { LoginInputSchema, LoginWithGoogleInputSchema } from './auth.schema'
import { Public } from './decorators/public.metadata'

@Public()
@Resolver()
export class AuthResolver {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly loginWithGoogleUseCase: LoginWithGoogleUseCase,
  ) {}

  @Mutation()
  async login(
    @Args('input', new ZodPipe(LoginInputSchema)) input: LoginInput,
    @RealIP() ip: string,
  ): Promise<LoginResult> {
    const result = await this.loginUseCase.execute({
      email: input.email,
      password: input.password,
      ip,
    })

    return {
      __typename: 'LoginOutput',
      accessToken: result.access_token,
    }
  }

  @Mutation()
  async loginWithGoogle(
    @Args('input', new ZodPipe(LoginWithGoogleInputSchema)) input: LoginWithGoogleInput,
    @RealIP() ip: string,
  ): Promise<LoginWithGoogleResult> {
    const result = await this.loginWithGoogleUseCase.execute({
      code: input.code,
      createUserIfNotExists: input.createUserIfNotExists,
      ip,
    })

    return {
      __typename: 'LoginWithGoogleOutput',
      accessToken: result.access_token,
      newUserCreated: result.new_user_created,
      linkedToExistingUser: result.linked_to_existing_user,
    }
  }
}
