import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { RealIP } from 'nestjs-real-ip'

import { LoginUseCase } from '../application/use-case/login.use-case'
import { LoginWithGoogleUseCase } from '../application/use-case/login-with-google.use-case'
import { LoginInput, LoginOutput, LoginWithGoogleInput, LoginWithGoogleOutput } from './auth.dto'
import { Public } from './decorators/public.metadata'

@Public()
@Resolver()
export class AuthResolver {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly loginWithGoogleUseCase: LoginWithGoogleUseCase,
  ) {}

  @Mutation(() => LoginOutput)
  async login(@Args('input') input: LoginInput, @RealIP() ip: string): Promise<LoginOutput> {
    const result = await this.loginUseCase.execute({
      email: input.email,
      password: input.password,
      ip,
    })

    return {
      accessToken: result.access_token,
    }
  }

  @Mutation(() => LoginWithGoogleOutput)
  async loginWithGoogle(
    @Args('input') input: LoginWithGoogleInput,
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
