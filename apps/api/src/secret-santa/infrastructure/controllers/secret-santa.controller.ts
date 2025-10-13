import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '@wishlist/api/auth'
import {
  AttendeeDto,
  CreateSecretSantaInputDto,
  CreateSecretSantaUsersInputDto,
  CreateSecretSantaUsersOutputDto,
  EventId,
  ICurrentUser,
  SecretSantaDto,
  SecretSantaId,
  SecretSantaUserId,
  UpdateSecretSantaInputDto,
  UpdateSecretSantaUserInputDto,
} from '@wishlist/common'

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
} from '../../domain'

@ApiTags('Secret Santa')
@Controller('/secret-santa')
export class SecretSantaController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('/user/draw')
  getMySecretSantaDrawForEvent(
    @CurrentUser() currentUser: ICurrentUser,
    @Query('eventId') eventId: EventId,
  ): Promise<AttendeeDto | undefined> {
    return this.queryBus.execute(new GetSecretSantaDrawQuery({ currentUser, eventId }))
  }

  @Get('/')
  getSecretSantaForEvent(
    @CurrentUser() currentUser: ICurrentUser,
    @Query('eventId') eventId: EventId,
  ): Promise<SecretSantaDto | undefined> {
    return this.queryBus.execute(new GetSecretSantaQuery({ currentUser, eventId }))
  }

  @Post('/')
  createSecretSantaForEvent(
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: CreateSecretSantaInputDto,
  ): Promise<SecretSantaDto> {
    return this.commandBus.execute(
      new CreateSecretSantaCommand({
        currentUser,
        eventId: dto.event_id,
        budget: dto.budget,
        description: dto.description,
      }),
    )
  }

  @Patch('/:id')
  async updateSecretSanta(
    @Param('id') secretSantaId: SecretSantaId,
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: UpdateSecretSantaInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateSecretSantaCommand({
        secretSantaId,
        currentUser,
        description: dto.description,
        budget: dto.budget,
      }),
    )
  }

  @Delete('/:id')
  async deleteSecretSanta(
    @Param('id') secretSantaId: SecretSantaId,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<void> {
    await this.commandBus.execute(new DeleteSecretSantaCommand({ currentUser, secretSantaId }))
  }

  @Post('/:id/start')
  async startSecretSanta(
    @Param('id') secretSantaId: SecretSantaId,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<void> {
    await this.commandBus.execute(
      new StartSecretSantaCommand({
        secretSantaId,
        currentUser,
      }),
    )
  }

  @Post('/:id/cancel')
  async cancelSecretSanta(
    @Param('id') secretSantaId: SecretSantaId,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<void> {
    await this.commandBus.execute(
      new CancelSecretSantaCommand({
        secretSantaId,
        currentUser,
      }),
    )
  }

  @Post('/:id/users')
  addSecretSantaUsers(
    @Param('id') secretSantaId: SecretSantaId,
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: CreateSecretSantaUsersInputDto,
  ): Promise<CreateSecretSantaUsersOutputDto> {
    return this.commandBus.execute(
      new AddSecretSantaUserCommand({
        secretSantaId,
        currentUser,
        attendeeIds: dto.attendee_ids,
      }),
    )
  }

  @Put('/:id/user/:secretSantaUserId')
  async updateSecretSantaUser(
    @Param('id') secretSantaId: SecretSantaId,
    @Param('secretSantaUserId') secretSantaUserId: SecretSantaUserId,
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: UpdateSecretSantaUserInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateSecretSantaUserCommand({
        secretSantaId,
        secretSantaUserId,
        currentUser,
        exclusions: dto.exclusions,
      }),
    )
  }

  @Delete('/:id/user/:secretSantaUserId')
  async deleteSecretSantaUser(
    @Param('id') secretSantaId: SecretSantaId,
    @Param('secretSantaUserId') secretSantaUserId: SecretSantaUserId,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteSecretSantaUserCommand({
        secretSantaId,
        secretSantaUserId,
        currentUser,
      }),
    )
  }
}
