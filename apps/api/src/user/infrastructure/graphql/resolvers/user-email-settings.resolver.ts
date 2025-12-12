import { UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { ICurrentUser } from '@wishlist/common'

import { GqlAuthGuard, GqlCurrentUser } from '../../../../graphql'
import {
  ConfirmEmailChangeCommand,
  CreateEmailChangeVerificationCommand,
  GetPendingEmailChangeQuery,
  GetUserEmailSettingQuery,
  UpdateUserEmailSettingCommand,
} from '../../../domain'
import { userGraphQLMapper } from '../mappers'
import {
  ConfirmEmailChangeInput,
  PendingEmailChangeObject,
  RequestEmailChangeInput,
  UpdateUserEmailSettingsInput,
  UserEmailSettingsObject,
} from '../types'

@Resolver()
export class UserEmailSettingsResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Query(() => UserEmailSettingsObject, { name: 'userEmailSettings', description: 'Get user email settings' })
  @UseGuards(GqlAuthGuard)
  async userEmailSettings(@GqlCurrentUser() currentUser: ICurrentUser): Promise<UserEmailSettingsObject> {
    const settings = await this.queryBus.execute(new GetUserEmailSettingQuery({ currentUser }))
    return userGraphQLMapper.toUserEmailSettingsObject(settings)
  }

  @Query(() => PendingEmailChangeObject, {
    nullable: true,
    name: 'pendingEmailChange',
    description: 'Get pending email change request',
  })
  @UseGuards(GqlAuthGuard)
  async pendingEmailChange(@GqlCurrentUser() currentUser: ICurrentUser): Promise<PendingEmailChangeObject | null> {
    const pending = await this.queryBus.execute(new GetPendingEmailChangeQuery({ currentUser }))
    if (!pending) return null
    return {
      newEmail: pending.newEmail,
      expiredAt: pending.expiredAt,
    }
  }

  @Mutation(() => UserEmailSettingsObject, { name: 'updateEmailSettings', description: 'Update user email settings' })
  @UseGuards(GqlAuthGuard)
  async updateEmailSettings(
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Args('input') input: UpdateUserEmailSettingsInput,
  ): Promise<UserEmailSettingsObject> {
    const settings = await this.commandBus.execute(
      new UpdateUserEmailSettingCommand({
        currentUser,
        dailyNewItemNotification: input.dailyNewItemNotification,
      }),
    )
    return userGraphQLMapper.toUserEmailSettingsObject(settings)
  }

  @Mutation(() => Boolean, { name: 'requestEmailChange', description: 'Request email change' })
  @UseGuards(GqlAuthGuard)
  async requestEmailChange(
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Args('input') input: RequestEmailChangeInput,
  ): Promise<boolean> {
    await this.commandBus.execute(
      new CreateEmailChangeVerificationCommand({
        currentUser,
        newEmail: input.newEmail.toLowerCase(),
      }),
    )
    return true
  }

  @Mutation(() => Boolean, { name: 'confirmEmailChange', description: 'Confirm email change with token' })
  async confirmEmailChange(@Args('input') input: ConfirmEmailChangeInput): Promise<boolean> {
    await this.commandBus.execute(
      new ConfirmEmailChangeCommand({
        newEmail: input.newEmail.toLowerCase(),
        token: input.token,
      }),
    )
    return true
  }
}
