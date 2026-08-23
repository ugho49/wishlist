import type { ICurrentUser } from '@wishlist/common';

import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { type EventId, type SecretSantaId, type SecretSantaUserId } from '@wishlist/common';

import { GqlCurrentUser } from '../../../auth/infrastructure/decorators/user.decorator';
import { ZodPipe } from '../../../core/graphql/zod-pipe';
import { eventMapper } from '../../../event/infrastructure/event.mapper';
import {
  type AddSecretSantaUsersInput,
  type AddSecretSantaUsersResult,
  type CancelSecretSantaResult,
  type CreateSecretSantaInput,
  type CreateSecretSantaResult,
  type DeleteSecretSantaResult,
  type DeleteSecretSantaUserResult,
  type GetMySecretSantaDrawResult,
  type GetSecretSantaForEventResult,
  type StartSecretSantaResult,
  type UpdateSecretSantaInput,
  type UpdateSecretSantaResult,
  type UpdateSecretSantaUserInput,
  type UpdateSecretSantaUserResult,
} from '../../../gql/generated-types';
import { AddSecretSantaUsersUseCase } from '../../application/command/add-secret-santa-users.use-case';
import { CancelSecretSantaUseCase } from '../../application/command/cancel-secret-santa.use-case';
import { CreateSecretSantaUseCase } from '../../application/command/create-secret-santa.use-case';
import { DeleteSecretSantaUseCase } from '../../application/command/delete-secret-santa.use-case';
import { DeleteSecretSantaUserUseCase } from '../../application/command/delete-secret-santa-user.use-case';
import { StartSecretSantaUseCase } from '../../application/command/start-secret-santa.use-case';
import { UpdateSecretSantaUseCase } from '../../application/command/update-secret-santa.use-case';
import { UpdateSecretSantaUserUseCase } from '../../application/command/update-secret-santa-user.use-case';
import { GetSecretSantaUseCase } from '../../application/query/get-secret-santa.use-case';
import { GetSecretSantaDrawUseCase } from '../../application/query/get-secret-santa-draw.use-case';
import { secretSantaMapper } from '../secret-santa.mapper';
import {
  AddSecretSantaUsersInputSchema,
  CreateSecretSantaInputSchema,
  EventIdSchema,
  SecretSantaIdSchema,
  SecretSantaUserIdSchema,
  UpdateSecretSantaInputSchema,
  UpdateSecretSantaUserInputSchema,
} from '../secret-santa.schema';

@Resolver()
export class SecretSantaResolver {
  constructor(
    private readonly getSecretSantaUseCase: GetSecretSantaUseCase,
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

  @Query()
  async secretSanta(
    @Args('eventId', new ZodPipe(EventIdSchema)) eventId: EventId,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<GetSecretSantaForEventResult | null> {
    const { secretSanta } = await this.getSecretSantaUseCase.execute({ currentUser, eventId });
    if (!secretSanta) return null;
    return secretSantaMapper.toGqlSecretSanta(secretSanta);
  }

  @Query()
  async mySecretSantaDraw(
    @Args('eventId', new ZodPipe(EventIdSchema)) eventId: EventId,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<GetMySecretSantaDrawResult | null> {
    const result = await this.getSecretSantaDrawUseCase.execute({ currentUser, eventId });
    if (!result) return null;
    return eventMapper.toGqlEventAttendeeFromDto(result);
  }

  @Mutation()
  async createSecretSanta(
    @Args('input', new ZodPipe(CreateSecretSantaInputSchema)) input: CreateSecretSantaInput,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<CreateSecretSantaResult> {
    const { secretSanta } = await this.createSecretSantaUseCase.execute({
      currentUser,
      eventId: input.eventId,
      budget: input.budget ?? undefined,
      description: input.description ?? undefined,
    });

    return secretSantaMapper.toGqlSecretSanta(secretSanta);
  }

  @Mutation()
  async updateSecretSanta(
    @Args('id', new ZodPipe(SecretSantaIdSchema)) id: SecretSantaId,
    @Args('input', new ZodPipe(UpdateSecretSantaInputSchema)) input: UpdateSecretSantaInput,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<UpdateSecretSantaResult> {
    await this.updateSecretSantaUseCase.execute({
      secretSantaId: id,
      currentUser,
      description: input.description ?? undefined,
      budget: input.budget ?? undefined,
    });

    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async deleteSecretSanta(
    @Args('id', new ZodPipe(SecretSantaIdSchema)) id: SecretSantaId,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<DeleteSecretSantaResult> {
    await this.deleteSecretSantaUseCase.execute({ currentUser, secretSantaId: id });
    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async startSecretSanta(
    @Args('id', new ZodPipe(SecretSantaIdSchema)) id: SecretSantaId,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<StartSecretSantaResult> {
    await this.startSecretSantaUseCase.execute({ secretSantaId: id, currentUser });
    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async cancelSecretSanta(
    @Args('id', new ZodPipe(SecretSantaIdSchema)) id: SecretSantaId,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<CancelSecretSantaResult> {
    await this.cancelSecretSantaUseCase.execute({ secretSantaId: id, currentUser });
    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async addSecretSantaUsers(
    @Args('id', new ZodPipe(SecretSantaIdSchema)) id: SecretSantaId,
    @Args('input', new ZodPipe(AddSecretSantaUsersInputSchema)) input: AddSecretSantaUsersInput,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<AddSecretSantaUsersResult> {
    const { users } = await this.addSecretSantaUsersUseCase.execute({
      secretSantaId: id,
      currentUser,
      attendeeIds: input.attendeeIds,
    });

    return {
      __typename: 'AddSecretSantaUsersOutput',
      users: users.map(secretSantaMapper.toGqlSecretSantaUser),
    };
  }

  @Mutation()
  async updateSecretSantaUser(
    @Args('id', new ZodPipe(SecretSantaIdSchema)) id: SecretSantaId,
    @Args('secretSantaUserId', new ZodPipe(SecretSantaUserIdSchema)) secretSantaUserId: SecretSantaUserId,
    @Args('input', new ZodPipe(UpdateSecretSantaUserInputSchema)) input: UpdateSecretSantaUserInput,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<UpdateSecretSantaUserResult> {
    await this.updateSecretSantaUserUseCase.execute({
      secretSantaId: id,
      secretSantaUserId,
      currentUser,
      exclusions: input.exclusions,
    });

    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async deleteSecretSantaUser(
    @Args('id', new ZodPipe(SecretSantaIdSchema)) id: SecretSantaId,
    @Args('secretSantaUserId', new ZodPipe(SecretSantaUserIdSchema)) secretSantaUserId: SecretSantaUserId,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<DeleteSecretSantaUserResult> {
    await this.deleteSecretSantaUserUseCase.execute({ secretSantaId: id, secretSantaUserId, currentUser });
    return { __typename: 'VoidOutput', success: true };
  }
}
