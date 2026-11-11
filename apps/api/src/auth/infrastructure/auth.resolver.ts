import { Args, Ctx, Mutation, Resolver } from '@znight/graphql';

import { type GraphQLContext } from '../../core/graphql/graphql.context';
import {
  type LoginInput,
  type LoginResult,
  type LoginWithGoogleInput,
  type LoginWithGoogleResult,
  type LogoutInput,
  type LogoutResult,
  type RefreshSessionInput,
  type RefreshSessionResult,
} from '../../gql/generated-types';
import { LoginUseCase } from '../application/commands/login.use-case';
import { LoginWithGoogleUseCase } from '../application/commands/login-with-google.use-case';
import { LogoutUseCase } from '../application/commands/logout.use-case';
import { RefreshSessionUseCase } from '../application/commands/refresh-session.use-case';
import {
  LoginInputSchema,
  LoginWithGoogleInputSchema,
  LogoutInputSchema,
  RefreshSessionInputSchema,
} from './auth.schema';
import { Public } from './decorators/public.metadata';

@Public()
@Resolver()
export class AuthResolver {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly loginWithGoogleUseCase: LoginWithGoogleUseCase,
    private readonly refreshSessionUseCase: RefreshSessionUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Mutation()
  async login(@Args('input', LoginInputSchema) input: LoginInput, @Ctx() ctx: GraphQLContext): Promise<LoginResult> {
    const result = await this.loginUseCase.execute({
      email: input.email,
      password: input.password,
      ip: ctx.http?.ip,
      userAgent: ctx.http?.header('user-agent'),
    });

    return {
      __typename: 'LoginOutput',
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }

  @Mutation()
  async loginWithGoogle(
    @Args('input', LoginWithGoogleInputSchema) input: LoginWithGoogleInput,
    @Ctx() ctx: GraphQLContext,
  ): Promise<LoginWithGoogleResult> {
    const result = await this.loginWithGoogleUseCase.execute({
      code: input.code,
      createUserIfNotExists: input.createUserIfNotExists,
      ip: ctx.http?.ip,
      userAgent: ctx.http?.header('user-agent'),
    });

    return {
      __typename: 'LoginWithGoogleOutput',
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      newUserCreated: result.newUserCreated,
      linkedToExistingUser: result.linkedToExistingUser,
    };
  }

  @Mutation()
  async refreshSession(
    @Args('input', RefreshSessionInputSchema) input: RefreshSessionInput,
    @Ctx() ctx: GraphQLContext,
  ): Promise<RefreshSessionResult> {
    const result = await this.refreshSessionUseCase.execute({
      refreshToken: input.refreshToken,
      ip: ctx.http?.ip,
      userAgent: ctx.http?.header('user-agent'),
    });

    return {
      __typename: 'LoginOutput',
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }

  @Mutation()
  async logout(@Args('input', LogoutInputSchema) input: LogoutInput): Promise<LogoutResult> {
    await this.logoutUseCase.execute({ refreshToken: input.refreshToken });
    return { __typename: 'VoidOutput', success: true };
  }
}
