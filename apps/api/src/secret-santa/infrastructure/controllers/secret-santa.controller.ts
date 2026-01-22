import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common'
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

import { AddSecretSantaUsersUseCase } from '../../application/command/add-secret-santa-users.use-case'
import { CancelSecretSantaUseCase } from '../../application/command/cancel-secret-santa.use-case'
import { CreateSecretSantaUseCase } from '../../application/command/create-secret-santa.use-case'
import { DeleteSecretSantaUseCase } from '../../application/command/delete-secret-santa.use-case'
import { DeleteSecretSantaUserUseCase } from '../../application/command/delete-secret-santa-user.use-case'
import { StartSecretSantaUseCase } from '../../application/command/start-secret-santa.use-case'
import { UpdateSecretSantaUseCase } from '../../application/command/update-secret-santa.use-case'
import { UpdateSecretSantaUserUseCase } from '../../application/command/update-secret-santa-user.use-case'
import { GetSecretSantaUseCase } from '../../application/query/get-secret-santa.use-case'
import { GetSecretSantaDrawUseCase } from '../../application/query/get-secret-santa-draw.use-case'

@ApiTags('Secret Santa')
@Controller('/secret-santa')
export class SecretSantaController {
  constructor(
    private readonly getSecretSantaDrawUseCase: GetSecretSantaDrawUseCase,
    private readonly getSecretSantaUseCase: GetSecretSantaUseCase,
    private readonly createSecretSantaUseCase: CreateSecretSantaUseCase,
    private readonly updateSecretSantaUseCase: UpdateSecretSantaUseCase,
    private readonly deleteSecretSantaUseCase: DeleteSecretSantaUseCase,
    private readonly startSecretSantaUseCase: StartSecretSantaUseCase,
    private readonly cancelSecretSantaUseCase: CancelSecretSantaUseCase,
    private readonly addSecretSantaUsersUseCase: AddSecretSantaUsersUseCase,
    private readonly updateSecretSantaUserUseCase: UpdateSecretSantaUserUseCase,
    private readonly deleteSecretSantaUserUseCase: DeleteSecretSantaUserUseCase,
  ) {}

  @Get('/user/draw')
  getMySecretSantaDrawForEvent(
    @CurrentUser() currentUser: ICurrentUser,
    @Query('eventId') eventId: EventId,
  ): Promise<AttendeeDto | undefined> {
    return this.getSecretSantaDrawUseCase.execute({ currentUser, eventId })
  }

  @Get('/')
  getSecretSantaForEvent(
    @CurrentUser() currentUser: ICurrentUser,
    @Query('eventId') eventId: EventId,
  ): Promise<SecretSantaDto | undefined> {
    return this.getSecretSantaUseCase.execute({ currentUser, eventId })
  }

  @Post('/')
  createSecretSantaForEvent(
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: CreateSecretSantaInputDto,
  ): Promise<SecretSantaDto> {
    return this.createSecretSantaUseCase.execute({
      currentUser,
      eventId: dto.event_id,
      budget: dto.budget,
      description: dto.description,
    })
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

  @Post('/:id/users')
  addSecretSantaUsers(
    @Param('id') secretSantaId: SecretSantaId,
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: CreateSecretSantaUsersInputDto,
  ): Promise<CreateSecretSantaUsersOutputDto> {
    return this.addSecretSantaUsersUseCase.execute({
      secretSantaId,
      currentUser,
      attendeeIds: dto.attendee_ids,
    })
  }

  @Put('/:id/user/:secretSantaUserId')
  async updateSecretSantaUser(
    @Param('id') secretSantaId: SecretSantaId,
    @Param('secretSantaUserId') secretSantaUserId: SecretSantaUserId,
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: UpdateSecretSantaUserInputDto,
  ): Promise<void> {
    await this.updateSecretSantaUserUseCase.execute({
      secretSantaId,
      secretSantaUserId,
      currentUser,
      exclusions: dto.exclusions,
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
