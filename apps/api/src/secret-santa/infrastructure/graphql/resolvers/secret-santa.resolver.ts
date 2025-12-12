import { UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { AttendeeId, EventId, ICurrentUser, SecretSantaId, SecretSantaUserId } from '@wishlist/common'

import { AttendeeObject, eventGraphQLMapper } from '../../../../event/infrastructure/graphql'
import { GqlAuthGuard, GqlCurrentUser } from '../../../../graphql'
import {
  AddSecretSantaUserCommand,
  CancelSecretSantaCommand,
  CreateSecretSantaCommand,
  DeleteSecretSantaCommand,
  DeleteSecretSantaUserCommand,
  GetSecretSantaDrawQuery,
  GetSecretSantaQuery,
  StartSecretSantaCommand,
  UpdateSecretSantaCommand,
  UpdateSecretSantaUserCommand,
} from '../../../domain'
import { secretSantaGraphQLMapper } from '../mappers'
import {
  AddSecretSantaUsersInput,
  AddSecretSantaUsersResultObject,
  CreateSecretSantaInput,
  SecretSantaObject,
  UpdateSecretSantaInput,
  UpdateSecretSantaUserInput,
} from '../types'

@Resolver()
@UseGuards(GqlAuthGuard)
export class SecretSantaResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Query(() => SecretSantaObject, {
    nullable: true,
    name: 'secretSanta',
    description: 'Get Secret Santa for an event',
  })
  async secretSanta(
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Args('eventId', { type: () => ID }) eventId: EventId,
  ): Promise<SecretSantaObject | null> {
    const result = await this.queryBus.execute(new GetSecretSantaQuery({ currentUser, eventId }))
    if (!result) return null
    return secretSantaGraphQLMapper.toSecretSantaObject(result)
  }

  @Query(() => AttendeeObject, {
    nullable: true,
    name: 'mySecretSantaDraw',
    description: 'Get my Secret Santa draw for an event',
  })
  async mySecretSantaDraw(
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Args('eventId', { type: () => ID }) eventId: EventId,
  ): Promise<AttendeeObject | null> {
    const result = await this.queryBus.execute(new GetSecretSantaDrawQuery({ currentUser, eventId }))
    if (!result) return null
    return eventGraphQLMapper.toAttendeeObject(result)
  }

  @Mutation(() => SecretSantaObject, { name: 'createSecretSanta', description: 'Create a Secret Santa for an event' })
  async createSecretSanta(
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Args('input') input: CreateSecretSantaInput,
  ): Promise<SecretSantaObject> {
    const result = await this.commandBus.execute(
      new CreateSecretSantaCommand({
        currentUser,
        eventId: input.eventId as EventId,
        budget: input.budget,
        description: input.description,
      }),
    )
    return secretSantaGraphQLMapper.toSecretSantaObject(result)
  }

  @Mutation(() => Boolean, { name: 'updateSecretSanta', description: 'Update a Secret Santa' })
  async updateSecretSanta(
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Args('id', { type: () => ID }) secretSantaId: SecretSantaId,
    @Args('input') input: UpdateSecretSantaInput,
  ): Promise<boolean> {
    await this.commandBus.execute(
      new UpdateSecretSantaCommand({
        secretSantaId,
        currentUser,
        description: input.description,
        budget: input.budget,
      }),
    )
    return true
  }

  @Mutation(() => Boolean, { name: 'deleteSecretSanta', description: 'Delete a Secret Santa' })
  async deleteSecretSanta(
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Args('id', { type: () => ID }) secretSantaId: SecretSantaId,
  ): Promise<boolean> {
    await this.commandBus.execute(new DeleteSecretSantaCommand({ currentUser, secretSantaId }))
    return true
  }

  @Mutation(() => Boolean, { name: 'startSecretSanta', description: 'Start the Secret Santa draw' })
  async startSecretSanta(
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Args('id', { type: () => ID }) secretSantaId: SecretSantaId,
  ): Promise<boolean> {
    await this.commandBus.execute(
      new StartSecretSantaCommand({
        secretSantaId,
        currentUser,
      }),
    )
    return true
  }

  @Mutation(() => Boolean, { name: 'cancelSecretSanta', description: 'Cancel a started Secret Santa' })
  async cancelSecretSanta(
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Args('id', { type: () => ID }) secretSantaId: SecretSantaId,
  ): Promise<boolean> {
    await this.commandBus.execute(
      new CancelSecretSantaCommand({
        secretSantaId,
        currentUser,
      }),
    )
    return true
  }

  @Mutation(() => AddSecretSantaUsersResultObject, {
    name: 'addSecretSantaUsers',
    description: 'Add users to a Secret Santa',
  })
  async addSecretSantaUsers(
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Args('secretSantaId', { type: () => ID }) secretSantaId: SecretSantaId,
    @Args('input') input: AddSecretSantaUsersInput,
  ): Promise<AddSecretSantaUsersResultObject> {
    const result = await this.commandBus.execute(
      new AddSecretSantaUserCommand({
        secretSantaId,
        currentUser,
        attendeeIds: input.attendeeIds as AttendeeId[],
      }),
    )
    return {
      users: result.users.map(secretSantaGraphQLMapper.toSecretSantaUserObject),
    }
  }

  @Mutation(() => Boolean, { name: 'updateSecretSantaUser', description: 'Update exclusions for a Secret Santa user' })
  async updateSecretSantaUser(
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Args('secretSantaId', { type: () => ID }) secretSantaId: SecretSantaId,
    @Args('secretSantaUserId', { type: () => ID }) secretSantaUserId: SecretSantaUserId,
    @Args('input') input: UpdateSecretSantaUserInput,
  ): Promise<boolean> {
    await this.commandBus.execute(
      new UpdateSecretSantaUserCommand({
        secretSantaId,
        secretSantaUserId,
        currentUser,
        exclusions: input.exclusions as SecretSantaUserId[],
      }),
    )
    return true
  }

  @Mutation(() => Boolean, { name: 'deleteSecretSantaUser', description: 'Remove a user from a Secret Santa' })
  async deleteSecretSantaUser(
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Args('secretSantaId', { type: () => ID }) secretSantaId: SecretSantaId,
    @Args('secretSantaUserId', { type: () => ID }) secretSantaUserId: SecretSantaUserId,
  ): Promise<boolean> {
    await this.commandBus.execute(
      new DeleteSecretSantaUserCommand({
        secretSantaId,
        secretSantaUserId,
        currentUser,
      }),
    )
    return true
  }
}
