import { Controller, Delete, Get, Param, Post, Query } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { ApiTags } from '@nestjs/swagger'
import { CurrentUser, IsAdmin } from '@wishlist/api/auth'
import { EventId, ICurrentUser, SecretSantaDto, SecretSantaId } from '@wishlist/common'

import {
  CancelSecretSantaCommand,
  DeleteSecretSantaCommand,
  GetSecretSantaQuery,
  StartSecretSantaCommand,
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
}
