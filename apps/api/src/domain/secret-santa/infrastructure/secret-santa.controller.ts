import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { ApiTags } from '@nestjs/swagger'
import {
  AttendeeDto,
  CreateSecretSantaInputDto,
  CreateSecretSantaUsersInputDto,
  CreateSecretSantaUsersOutputDto,
  EventId,
  SecretSantaDto,
  SecretSantaId,
  SecretSantaUserId,
  UpdateSecretSantaInputDto,
  UpdateSecretSantaUserInputDto,
  UserId,
} from '@wishlist/common'

import { CurrentUser } from '../../auth'
import { AddSecretSantaUserCommand } from '../application/command/add-secret-santa-user.command'
import { CancelSecretSantaCommand } from '../application/command/cancel-secret-santa.command'
import { CreateSecretSantaCommand } from '../application/command/create-secret-santa.command'
import { DeleteSecretSantaUserCommand } from '../application/command/delete-secret-santa-user.command'
import { DeleteSecretSantaCommand } from '../application/command/delete-secret-santa.command'
import { StartSecretSantaCommand } from '../application/command/start-secret-santa.command'
import { UpdateSecretSantaUserCommand } from '../application/command/update-secret-santa-user.command'
import { UpdateSecretSantaCommand } from '../application/command/update-secret-santa.command'
import { GetSecretSantaDrawQuery } from '../application/query/get-secret-santa-draw.query'
import { GetSecretSantaQuery } from '../application/query/get-secret-santa.query'

@ApiTags('Secret Santa')
@Controller('/secret-santa')
export class SecretSantaController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('/user/draw')
  getMySecretSantaDrawForEvent(
    @CurrentUser('id') currentUserId: UserId,
    @Query('eventId') eventId: EventId,
  ): Promise<AttendeeDto | undefined> {
    return this.queryBus.execute(new GetSecretSantaDrawQuery({ userId: currentUserId, eventId }))
  }

  @Get('/')
  getSecretSantaForEvent(
    @CurrentUser('id') currentUserId: UserId,
    @Query('eventId') eventId: EventId,
  ): Promise<SecretSantaDto | undefined> {
    return this.queryBus.execute(new GetSecretSantaQuery({ userId: currentUserId, eventId }))
  }

  @Post('/')
  createSecretSantaForEvent(
    @CurrentUser('id') currentUserId: UserId,
    @Body() dto: CreateSecretSantaInputDto,
  ): Promise<SecretSantaDto> {
    return this.commandBus.execute(
      new CreateSecretSantaCommand({
        userId: currentUserId,
        eventId: dto.event_id,
        budget: dto.budget,
        description: dto.description,
      }),
    )
  }

  @Patch('/:id')
  async updateSecretSanta(
    @Param('id') secretSantaId: SecretSantaId,
    @CurrentUser('id') currentUserId: UserId,
    @Body() dto: UpdateSecretSantaInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateSecretSantaCommand({
        secretSantaId,
        userId: currentUserId,
        description: dto.description,
        budget: dto.budget,
      }),
    )
  }

  @Delete('/:id')
  async deleteSecretSanta(
    @Param('id') secretSantaId: SecretSantaId,
    @CurrentUser('id') currentUserId: UserId,
  ): Promise<void> {
    await this.commandBus.execute(new DeleteSecretSantaCommand({ userId: currentUserId, secretSantaId }))
  }

  @Post('/:id/start')
  async startSecretSanta(
    @Param('id') secretSantaId: SecretSantaId,
    @CurrentUser('id') currentUserId: UserId,
  ): Promise<void> {
    await this.commandBus.execute(
      new StartSecretSantaCommand({
        secretSantaId,
        userId: currentUserId,
      }),
    )
  }

  @Post('/:id/cancel')
  async cancelSecretSanta(
    @Param('id') secretSantaId: SecretSantaId,
    @CurrentUser('id') currentUserId: UserId,
  ): Promise<void> {
    await this.commandBus.execute(
      new CancelSecretSantaCommand({
        secretSantaId,
        userId: currentUserId,
      }),
    )
  }

  @Post('/:id/users')
  async addSecretSantaUsers(
    @Param('id') secretSantaId: SecretSantaId,
    @CurrentUser('id') currentUserId: UserId,
    @Body() dto: CreateSecretSantaUsersInputDto,
  ): Promise<CreateSecretSantaUsersOutputDto> {
    return this.commandBus.execute(
      new AddSecretSantaUserCommand({
        secretSantaId,
        userId: currentUserId,
        attendeeIds: dto.attendee_ids,
      }),
    )
  }

  @Put('/:id/user/:secretSantaUserId')
  async updateSecretSantaUser(
    @Param('id') secretSantaId: SecretSantaId,
    @Param('secretSantaUserId') secretSantaUserId: SecretSantaUserId,
    @CurrentUser('id') currentUserId: UserId,
    @Body() dto: UpdateSecretSantaUserInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateSecretSantaUserCommand({
        secretSantaId,
        secretSantaUserId,
        userId: currentUserId,
        exclusions: dto.exclusions,
      }),
    )
  }

  @Delete('/:id/user/:secretSantaUserId')
  async deleteSecretSantaUser(
    @Param('id') secretSantaId: SecretSantaId,
    @Param('secretSantaUserId') secretSantaUserId: SecretSantaUserId,
    @CurrentUser('id') currentUserId: UserId,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteSecretSantaUserCommand({
        secretSantaId,
        secretSantaUserId,
        userId: currentUserId,
      }),
    )
  }
}
