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

@ApiTags('Secret Santa')
@Controller('/secret-santa')
export class SecretSantaController {
  constructor(private readonly busService: BusService) {}

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
  async updateSecretSanta(
    @Param('id') secretSantaId: SecretSantaId,
    @CurrentUser('id') currentUserId: UserId,
    @Body() dto: UpdateSecretSantaInputDto,
  ): Promise<void> {
    await this.busService.dispatchCommand('updateSecretSanta', {
      secretSantaId,
      userId: currentUserId,
      description: dto.description,
      budget: dto.budget,
    })
  }

  @Delete('/:id')
  async deleteSecretSanta(
    @Param('id') secretSantaId: SecretSantaId,
    @CurrentUser('id') currentUserId: UserId,
  ): Promise<void> {
    await this.busService.dispatchCommand('deleteSecretSanta', {
      secretSantaId,
      userId: currentUserId,
    })
  }

  @Post('/:id/start')
  async startSecretSanta(
    @Param('id') secretSantaId: SecretSantaId,
    @CurrentUser('id') currentUserId: UserId,
  ): Promise<void> {
    await this.busService.dispatchCommand('startSecretSanta', {
      secretSantaId,
      userId: currentUserId,
    })
  }

  @Post('/:id/cancel')
  async cancelSecretSanta(
    @Param('id') secretSantaId: SecretSantaId,
    @CurrentUser('id') currentUserId: UserId,
  ): Promise<void> {
    await this.busService.dispatchCommand('cancelSecretSanta', {
      secretSantaId,
      userId: currentUserId,
    })
  }

  @Post('/:id/users')
  async addSecretSantaUsers(
    @Param('id') secretSantaId: SecretSantaId,
    @CurrentUser('id') currentUserId: UserId,
    @Body() dto: CreateSecretSantaUsersInputDto,
  ): Promise<CreateSecretSantaUsersOutputDto> {
    const result = await this.busService.dispatchCommand('addSecretSantaUser', {
      secretSantaId,
      userId: currentUserId,
      attendeeIds: dto.attendee_ids,
    })

    if (!result) throw new Error('Failed to add secret santa users')

    return result
  }

  @Put('/:id/user/:secretSantaUserId')
  async updateSecretSantaUser(
    @Param('id') secretSantaId: SecretSantaId,
    @Param('secretSantaUserId') secretSantaUserId: SecretSantaUserId,
    @CurrentUser('id') currentUserId: UserId,
    @Body() dto: UpdateSecretSantaUserInputDto,
  ): Promise<void> {
    await this.busService.dispatchCommand('updateSecretSantaUser', {
      secretSantaId,
      secretSantaUserId,
      userId: currentUserId,
      exclusions: dto.exclusions,
    })
  }

  @Delete('/:id/user/:secretSantaUserId')
  async deleteSecretSantaUser(
    @Param('id') secretSantaId: SecretSantaId,
    @Param('secretSantaUserId') secretSantaUserId: SecretSantaUserId,
    @CurrentUser('id') currentUserId: UserId,
  ): Promise<void> {
    await this.busService.dispatchCommand('deleteSecretSantaUser', {
      secretSantaId,
      secretSantaUserId,
      userId: currentUserId,
    })
  }
}
