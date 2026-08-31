import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { RealIP } from 'nestjs-real-ip';

import { type GraphQLContext } from '../../core/graphql/graphql.context';
import { ZodPipe } from '../../core/graphql/zod-pipe';
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
import { getRequestUserAgent } from './util/request.utils';

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
  async login(
    @Args('input', new ZodPipe(LoginInputSchema)) input: LoginInput,
    @RealIP() ip: string,
    @Context() ctx: GraphQLContext,
  ): Promise<LoginResult> {
    const result = await this.loginUseCase.execute({
      email: input.email,
      password: input.password,
      ip,
      userAgent: getRequestUserAgent(ctx.req),
    });

    return {
      __typename: 'LoginOutput',
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }

  @Mutation()
  async loginWithGoogle(
    @Args('input', new ZodPipe(LoginWithGoogleInputSchema)) input: LoginWithGoogleInput,
    @RealIP() ip: string,
    @Context() ctx: GraphQLContext,
  ): Promise<LoginWithGoogleResult> {
    const result = await this.loginWithGoogleUseCase.execute({
      code: input.code,
      createUserIfNotExists: input.createUserIfNotExists,
      ip,
      userAgent: getRequestUserAgent(ctx.req),
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
    @Args('input', new ZodPipe(RefreshSessionInputSchema)) input: RefreshSessionInput,
    @RealIP() ip: string,
    @Context() ctx: GraphQLContext,
  ): Promise<RefreshSessionResult> {
    const result = await this.refreshSessionUseCase.execute({
      refreshToken: input.refreshToken,
      ip,
      userAgent: getRequestUserAgent(ctx.req),
    });

    return {
      __typename: 'LoginOutput',
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }

  @Mutation()
  async logout(@Args('input', new ZodPipe(LogoutInputSchema)) input: LogoutInput): Promise<LogoutResult> {
    await this.logoutUseCase.execute({ refreshToken: input.refreshToken });
    return { __typename: 'VoidOutput', success: true };
  }
}
