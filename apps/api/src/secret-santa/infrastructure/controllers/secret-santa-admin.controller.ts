import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
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

import { CancelSecretSantaUseCase } from '../../application/command/cancel-secret-santa.use-case'
import { DeleteSecretSantaUseCase } from '../../application/command/delete-secret-santa.use-case'
import { DeleteSecretSantaUserUseCase } from '../../application/command/delete-secret-santa-user.use-case'
import { StartSecretSantaUseCase } from '../../application/command/start-secret-santa.use-case'
import { UpdateSecretSantaUseCase } from '../../application/command/update-secret-santa.use-case'
import { GetSecretSantaUseCase } from '../../application/query/get-secret-santa.use-case'

@IsAdmin()
@ApiTags('ADMIN - Secret Santa')
@Controller('/admin/secret-santa')
export class SecretSantaAdminController {
  constructor(
    private readonly getSecretSantaUseCase: GetSecretSantaUseCase,
    private readonly updateSecretSantaUseCase: UpdateSecretSantaUseCase,
    private readonly deleteSecretSantaUseCase: DeleteSecretSantaUseCase,
    private readonly startSecretSantaUseCase: StartSecretSantaUseCase,
    private readonly cancelSecretSantaUseCase: CancelSecretSantaUseCase,
    private readonly deleteSecretSantaUserUseCase: DeleteSecretSantaUserUseCase,
  ) {}

  @Get('/')
  getSecretSantaForEvent(
    @CurrentUser() currentUser: ICurrentUser,
    @Query('eventId') eventId: EventId,
  ): Promise<SecretSantaDto | undefined> {
    return this.getSecretSantaUseCase.execute({ currentUser, eventId })
  }

  @Patch('/:id')
  async updateSecretSanta(
    @Param('id') secretSantaId: SecretSantaId,
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: UpdateSecretSantaInputDto,
  ): Promise<void> {
    await this.updateSecretSantaUseCase.execute({
      secretSantaId,
      currentUser,
      description: dto.description,
      budget: dto.budget,
    })
  }

  @Delete('/:id')
  async deleteSecretSanta(
    @Param('id') secretSantaId: SecretSantaId,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<void> {
    await this.deleteSecretSantaUseCase.execute({ currentUser, secretSantaId })
  }

  @Post('/:id/start')
  async startSecretSanta(
    @Param('id') secretSantaId: SecretSantaId,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<void> {
    await this.startSecretSantaUseCase.execute({
      secretSantaId,
      currentUser,
    })
  }

  @Post('/:id/cancel')
  async cancelSecretSanta(
    @Param('id') secretSantaId: SecretSantaId,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<void> {
    await this.cancelSecretSantaUseCase.execute({
      secretSantaId,
      currentUser,
    })
  }

  @Delete('/:id/user/:secretSantaUserId')
  async deleteSecretSantaUser(
    @Param('id') secretSantaId: SecretSantaId,
    @Param('secretSantaUserId') secretSantaUserId: SecretSantaUserId,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<void> {
    await this.deleteSecretSantaUserUseCase.execute({
      secretSantaId,
      secretSantaUserId,
      currentUser,
    })
  }
}
