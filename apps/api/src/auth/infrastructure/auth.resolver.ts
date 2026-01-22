import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { ZodPipe } from '@wishlist/api/core'
import { RealIP } from 'nestjs-real-ip'

import { LoginUseCase } from '../application/commands/login.use-case'
import { LoginWithGoogleUseCase } from '../application/commands/login-with-google.use-case'
import {
  LoginInput,
  LoginOutput,
  LoginResult,
  LoginWithGoogleInput,
  LoginWithGoogleOutput,
  LoginWithGoogleResult,
} from './auth.dto'
import { LoginInputSchema, LoginWithGoogleInputSchema } from './auth.schema'
import { Public } from './decorators/public.metadata'

@Public()
@Resolver()
export class AuthResolver {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly loginWithGoogleUseCase: LoginWithGoogleUseCase,
  ) {}

  @Mutation(() => LoginResult)
  async login(
    @Args('input', new ZodPipe(LoginInputSchema)) input: LoginInput,
    @RealIP() ip: string,
  ): Promise<LoginOutput> {
    const result = await this.loginUseCase.execute({
      email: input.email,
      password: input.password,
      ip,
    })

    return {
      accessToken: result.access_token,
    }
  }

  @Mutation(() => LoginWithGoogleResult)
  async loginWithGoogle(
    @Args('input', new ZodPipe(LoginWithGoogleInputSchema)) input: LoginWithGoogleInput,
    @RealIP() ip: string,
  ): Promise<LoginWithGoogleOutput> {
    const result = await this.loginWithGoogleUseCase.execute({
      code: input.code,
      createUserIfNotExists: input.createUserIfNotExists,
      ip,
    })

    return {
      accessToken: result.access_token,
      newUserCreated: result.new_user_created,
      linkedToExistingUser: result.linked_to_existing_user,
    }
  }
}
