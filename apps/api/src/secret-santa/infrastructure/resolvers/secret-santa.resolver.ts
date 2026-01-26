import type { ICurrentUser } from '@wishlist/common'

import { NotFoundException } from '@nestjs/common'
import { Args, Context, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { GqlCurrentUser } from '@wishlist/api/auth'
import { GraphQLContext, ZodPipe } from '@wishlist/api/core'
import { eventAttendeeMapper } from '@wishlist/api/event'
import { EventId, SecretSantaId, SecretSantaUserId } from '@wishlist/common'

import {
  AddSecretSantaUsersInput,
  AddSecretSantaUsersResult,
  CancelSecretSantaResult,
  CreateSecretSantaInput,
  CreateSecretSantaResult,
  DeleteSecretSantaResult,
  DeleteSecretSantaUserResult,
  Event,
  GetSecretSantaByEventResult,
  GetSecretSantaDrawForEventResult,
  SecretSanta,
  SecretSantaUser,
  StartSecretSantaResult,
  UpdateSecretSantaInput,
  UpdateSecretSantaResult,
  UpdateSecretSantaUserInput,
  UpdateSecretSantaUserResult,
} from '../../../gql/generated-types'
import { AddSecretSantaUsersUseCase } from '../../application/command/add-secret-santa-users.use-case'
import { CancelSecretSantaUseCase } from '../../application/command/cancel-secret-santa.use-case'
import { CreateSecretSantaUseCase } from '../../application/command/create-secret-santa.use-case'
import { DeleteSecretSantaUseCase } from '../../application/command/delete-secret-santa.use-case'
import { DeleteSecretSantaUserUseCase } from '../../application/command/delete-secret-santa-user.use-case'
import { StartSecretSantaUseCase } from '../../application/command/start-secret-santa.use-case'
import { UpdateSecretSantaUseCase } from '../../application/command/update-secret-santa.use-case'
import { UpdateSecretSantaUserUseCase } from '../../application/command/update-secret-santa-user.use-case'
import { GetSecretSantaByEventUseCase } from '../../application/query/get-secret-santa-by-event.use-case'
import { GetSecretSantaDrawUseCase } from '../../application/query/get-secret-santa-draw.use-case'
import { secretSantaMapper } from '../secret-santa.mapper'
import {
  AddSecretSantaUsersInputSchema,
  CreateSecretSantaInputSchema,
  EventIdSchema,
  SecretSantaIdSchema,
  SecretSantaUserIdSchema,
  UpdateSecretSantaInputSchema,
  UpdateSecretSantaUserInputSchema,
} from '../secret-santa.schema'

@Resolver('SecretSanta')
export class SecretSantaResolver {
  constructor(
    private readonly getSecretSantaUseCase: GetSecretSantaByEventUseCase,
    private readonly getSecretSantaDrawUseCase: GetSecretSantaDrawUseCase,
    private readonly createSecretSantaUseCase: CreateSecretSantaUseCase,
    private readonly updateSecretSantaUseCase: UpdateSecretSantaUseCase,
    private readonly deleteSecretSantaUseCase: DeleteSecretSantaUseCase,
    private readonly startSecretSantaUseCase: StartSecretSantaUseCase,
    private readonly cancelSecretSantaUseCase: CancelSecretSantaUseCase,
    private readonly addSecretSantaUsersUseCase: AddSecretSantaUsersUseCase,
    private readonly updateSecretSantaUserUseCase: UpdateSecretSantaUserUseCase,
    private readonly deleteSecretSantaUserUseCase: DeleteSecretSantaUserUseCase,
  ) {}

  @ResolveField()
  async event(@Parent() secretSanta: SecretSanta, @Context() ctx: GraphQLContext): Promise<Event> {
    const event = await ctx.loaders.event.load(secretSanta.eventId)
    if (!event) {
      throw new NotFoundException(`Event with id ${secretSanta.eventId} not found`)
    }
    return event
  }

  @ResolveField()
  users(@Parent() secretSanta: SecretSanta, @Context() ctx: GraphQLContext): Promise<SecretSantaUser[]> {
    return ctx.loaders.secretSantaUsersBySecretSanta.load(secretSanta.id)
  }

  @Query()
  async getSecretSantaForEvent(
    @Args('eventId', new ZodPipe(EventIdSchema)) eventId: EventId,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<GetSecretSantaByEventResult> {
    const result = await this.getSecretSantaUseCase.execute({
      currentUser,
      eventId,
    })

    if (!result) {
      throw new NotFoundException('Secret Santa not found for this event')
    }

    return secretSantaMapper.toGqlSecretSanta(result.secretSanta)
  }

  @Query()
  async getSecretSantaDrawForEvent(
    @Args('eventId', new ZodPipe(EventIdSchema)) eventId: EventId,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<GetSecretSantaDrawForEventResult> {
    const attendee = await this.getSecretSantaDrawUseCase.execute({
      currentUser,
      eventId,
    })

    return {
      __typename: 'GetSecretSantaDrawForEventOutput',
      attendee: attendee ? eventAttendeeMapper.toGqlEventAttendee(attendee) : undefined,
    }
  }

  @Mutation()
  async createSecretSanta(
    @Args('input', new ZodPipe(CreateSecretSantaInputSchema)) input: CreateSecretSantaInput,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<CreateSecretSantaResult> {
    const { secretSanta } = await this.createSecretSantaUseCase.execute({
      currentUser,
      eventId: input.eventId,
      description: input.description ?? undefined,
      budget: input.budget ?? undefined,
    })

    return secretSantaMapper.toGqlSecretSanta(secretSanta)
  }

  @Mutation()
  async updateSecretSanta(
    @Args('id', new ZodPipe(SecretSantaIdSchema)) id: SecretSantaId,
    @Args('input', new ZodPipe(UpdateSecretSantaInputSchema)) input: UpdateSecretSantaInput,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<UpdateSecretSantaResult> {
    await this.updateSecretSantaUseCase.execute({
      currentUser,
      secretSantaId: id,
      description: input.description ?? undefined,
      budget: input.budget ?? undefined,
    })

    return { __typename: 'VoidOutput', success: true }
  }

  @Mutation()
  async startSecretSanta(
    @Args('id', new ZodPipe(SecretSantaIdSchema)) id: SecretSantaId,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<StartSecretSantaResult> {
    await this.startSecretSantaUseCase.execute({
      currentUser,
      secretSantaId: id,
    })

    return { __typename: 'VoidOutput', success: true }
  }

  @Mutation()
  async cancelSecretSanta(
    @Args('id', new ZodPipe(SecretSantaIdSchema)) id: SecretSantaId,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<CancelSecretSantaResult> {
    await this.cancelSecretSantaUseCase.execute({
      currentUser,
      secretSantaId: id,
    })

    return { __typename: 'VoidOutput', success: true }
  }

  @Mutation()
  async deleteSecretSanta(
    @Args('id', new ZodPipe(SecretSantaIdSchema)) id: SecretSantaId,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<DeleteSecretSantaResult> {
    await this.deleteSecretSantaUseCase.execute({
      currentUser,
      secretSantaId: id,
    })

    return { __typename: 'VoidOutput', success: true }
  }

  @Mutation()
  async addSecretSantaUsers(
    @Args('id', new ZodPipe(SecretSantaIdSchema)) id: SecretSantaId,
    @Args('input', new ZodPipe(AddSecretSantaUsersInputSchema)) input: AddSecretSantaUsersInput,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<AddSecretSantaUsersResult> {
    const { users } = await this.addSecretSantaUsersUseCase.execute({
      currentUser,
      secretSantaId: id,
      attendeeIds: input.attendeeIds,
    })

    return {
      __typename: 'AddSecretSantaUsersOutput',
      users: users.map(secretSantaMapper.toGqlSecretSantaUser),
    }
  }

  @Mutation()
  async updateSecretSantaUser(
    @Args('secretSantaId', new ZodPipe(SecretSantaIdSchema)) secretSantaId: SecretSantaId,
    @Args('secretSantaUserId', new ZodPipe(SecretSantaUserIdSchema)) secretSantaUserId: SecretSantaUserId,
    @Args('input', new ZodPipe(UpdateSecretSantaUserInputSchema)) input: UpdateSecretSantaUserInput,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<UpdateSecretSantaUserResult> {
    await this.updateSecretSantaUserUseCase.execute({
      currentUser,
      secretSantaId,
      secretSantaUserId,
      exclusions: input.exclusionIds,
    })

    return { __typename: 'VoidOutput', success: true }
  }

  @Mutation()
  async deleteSecretSantaUser(
    @Args('secretSantaId', new ZodPipe(SecretSantaIdSchema)) secretSantaId: SecretSantaId,
    @Args('secretSantaUserId', new ZodPipe(SecretSantaUserIdSchema)) secretSantaUserId: SecretSantaUserId,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<DeleteSecretSantaUserResult> {
    await this.deleteSecretSantaUserUseCase.execute({
      currentUser,
      secretSantaId,
      secretSantaUserId,
    })

    return { __typename: 'VoidOutput', success: true }
  }
}
