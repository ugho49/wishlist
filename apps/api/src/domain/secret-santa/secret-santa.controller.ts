import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common'
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
} from '@wishlist/common-types'

import { BusService } from '../../core/bus/bus.service'
import { CurrentUser } from '../auth'
import { SecretSantaService } from './secret-santa.service'

@ApiTags('Secret Santa')
@Controller('/secret-santa')
export class SecretSantaController {
  constructor(
    private readonly secretSantaService: SecretSantaService,
    private readonly busService: BusService,
  ) {}

  @Get('/user/draw')
  getMySecretSantaDrawForEvent(
    @CurrentUser('id') currentUserId: UserId,
    @Query('eventId') eventId: EventId,
  ): Promise<AttendeeDto | undefined> {
    return this.busService.dispatchQuery('getSecretSantaDraw', { userId: currentUserId, eventId })
  }

  @Get('/')
  getSecretSantaForEvent(
    @CurrentUser('id') currentUserId: UserId,
    @Query('eventId') eventId: EventId,
  ): Promise<SecretSantaDto | undefined> {
    return this.busService.dispatchQuery('getSecretSanta', { userId: currentUserId, eventId })
  }

  @Post('/')
  async createSecretSantaForEvent(
    @CurrentUser('id') currentUserId: UserId,
    @Body() dto: CreateSecretSantaInputDto,
  ): Promise<SecretSantaDto> {
    const result = await this.busService.dispatchCommand('createSecretSanta', {
      userId: currentUserId,
      eventId: dto.event_id,
      budget: dto.budget,
      description: dto.description,
    })

    if (!result) throw new Error('Failed to create secret santa')

    return result
  }

  @Patch('/:id')
  updateSecretSanta(
    @Param('id') secretSantaId: SecretSantaId,
    @CurrentUser('id') currentUserId: UserId,
    @Body() dto: UpdateSecretSantaInputDto,
  ): Promise<void> {
    return this.secretSantaService.updateSecretSanta({ secretSantaId, currentUserId, dto })
  }

  @Delete('/:id')
  deleteSecretSanta(
    @Param('id') secretSantaId: SecretSantaId,
    @CurrentUser('id') currentUserId: UserId,
  ): Promise<void> {
    return this.secretSantaService.deleteSecretSanta({ secretSantaId, currentUserId })
  }

  @Post('/:id/start')
  startSecretSanta(@Param('id') secretSantaId: SecretSantaId, @CurrentUser('id') currentUserId: UserId): Promise<void> {
    return this.secretSantaService.startSecretSanta({ secretSantaId, currentUserId })
  }

  @Post('/:id/cancel')
  cancelSecretSanta(
    @Param('id') secretSantaId: SecretSantaId,
    @CurrentUser('id') currentUserId: UserId,
  ): Promise<void> {
    return this.secretSantaService.cancelSecretSanta({ secretSantaId, currentUserId })
  }

  @Post('/:id/users')
  addSecretSantaUsers(
    @Param('id') secretSantaId: SecretSantaId,
    @CurrentUser('id') currentUserId: UserId,
    @Body() dto: CreateSecretSantaUsersInputDto,
  ): Promise<CreateSecretSantaUsersOutputDto> {
    return this.secretSantaService.addSecretSantaUsers({ secretSantaId, currentUserId, dto })
  }

  @Put('/:id/user/:secretSantaUserId')
  updateSecretSantaUser(
    @Param('id') secretSantaId: SecretSantaId,
    @Param('secretSantaUserId') secretSantaUserId: SecretSantaUserId,
    @CurrentUser('id') currentUserId: UserId,
    @Body() dto: UpdateSecretSantaUserInputDto,
  ): Promise<void> {
    return this.secretSantaService.updateSecretSantaUser({
      secretSantaId,
      secretSantaUserId,
      currentUserId,
      dto,
    })
  }

  @Delete('/:id/user/:secretSantaUserId')
  deleteSecretSantaUser(
    @Param('id') secretSantaId: SecretSantaId,
    @Param('secretSantaUserId') secretSantaUserId: SecretSantaUserId,
    @CurrentUser('id') currentUserId: UserId,
  ): Promise<void> {
    return this.secretSantaService.deleteSecretSantaUser({ secretSantaId, secretSantaUserId, currentUserId })
  }
}
