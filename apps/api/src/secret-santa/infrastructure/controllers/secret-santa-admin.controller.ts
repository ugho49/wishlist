import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { ApiTags } from '@nestjs/swagger'
import { CurrentUser, IsAdmin } from '@wishlist/api/auth'
import {
  EventId,
  ICurrentUser,
  SecretSantaDto,
  SecretSantaId,
  SecretSantaUserId,
  UpdateSecretSantaInputDto,
} from '@wishlist/common'

import {
  CancelSecretSantaCommand,
  DeleteSecretSantaCommand,
  DeleteSecretSantaUserCommand,
  GetSecretSantaQuery,
  StartSecretSantaCommand,
  UpdateSecretSantaCommand,
} from '../../domain'

@IsAdmin()
@ApiTags('ADMIN - Secret Santa')
@Controller('/admin/secret-santa')
export class SecretSantaAdminController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('/')
  getSecretSantaForEvent(
    @CurrentUser() currentUser: ICurrentUser,
    @Query('eventId') eventId: EventId,
  ): Promise<SecretSantaDto | undefined> {
    return this.queryBus.execute(new GetSecretSantaQuery({ currentUser, eventId }))
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
