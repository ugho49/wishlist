import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import {
  AttendeeDto,
  CreateSecretSantaInputDto,
  CreateSecretSantaUserInputDto,
  SecretSantaDto,
  SecretSantaUserDto,
  UpdateSecretSantaInputDto,
  UpdateSecretSantaUserInputDto,
} from '@wishlist/common-types'

import { CurrentUser } from '../auth'
import { SecretSantaService } from './secret-santa.service'

@ApiTags('Secret Santa')
@Controller('/secret-santa')
export class SecretSantaController {
  constructor(private readonly secretSantaService: SecretSantaService) {}

  @Get('/user/draw')
  getMySecretSantaUserForEvent(
    @CurrentUser('id') currentUserId: string,
    @Query('eventId') eventId: string,
  ): Promise<AttendeeDto | null> {
    return this.secretSantaService.getMySecretSantaUserForEvent({ currentUserId, eventId })
  }

  @Get('/')
  getSecretSantaForEvent(
    @CurrentUser('id') currentUserId: string,
    @Query('eventId') eventId: string,
  ): Promise<SecretSantaDto | null> {
    return this.secretSantaService.getSecretSantaForEvent({ currentUserId, eventId })
  }

  @Post('/')
  createSecretSantaForEvent(
    @CurrentUser('id') currentUserId: string,
    @Body() dto: CreateSecretSantaInputDto,
  ): Promise<SecretSantaDto> {
    return this.secretSantaService.createSecretSantaForEvent({ currentUserId, dto })
  }

  @Put('/:id')
  updateSecretSanta(
    @Param('id') secretSantaId: string,
    @CurrentUser('id') currentUserId: string,
    @Body() dto: UpdateSecretSantaInputDto,
  ): Promise<void> {
    return this.secretSantaService.updateSecretSanta({ secretSantaId, currentUserId, dto })
  }

  @Delete('/:id')
  deleteSecretSanta(@Param('id') secretSantaId: string, @CurrentUser('id') currentUserId: string): Promise<void> {
    return this.secretSantaService.deleteSecretSanta({ secretSantaId, currentUserId })
  }

  @Post('/:id/start')
  startSecretSanta(@Param('id') secretSantaId: string, @CurrentUser('id') currentUserId: string): Promise<void> {
    return this.secretSantaService.startSecretSanta({ secretSantaId, currentUserId })
  }

  @Post('/:id/cancel')
  cancelSecretSanta(@Param('id') secretSantaId: string, @CurrentUser('id') currentUserId: string): Promise<void> {
    return this.secretSantaService.cancelSecretSanta({ secretSantaId, currentUserId })
  }

  @Post('/:id/user')
  addSecretSantaUser(
    @Param('id') secretSantaId: string,
    @CurrentUser('id') currentUserId: string,
    @Body() dto: CreateSecretSantaUserInputDto,
  ): Promise<SecretSantaUserDto> {
    return this.secretSantaService.addSecretSantaUser({ secretSantaId, currentUserId, dto })
  }

  @Put('/:id/user/:userId')
  updateSecretSantaUser(
    @Param('id') secretSantaId: string,
    @Param('userId') userId: string,
    @CurrentUser('id') currentUserId: string,
    @Body() dto: UpdateSecretSantaUserInputDto,
  ): Promise<void> {
    return this.secretSantaService.updateSecretSantaUser({
      secretSantaId,
      secretSantaUserId: userId,
      currentUserId,
      dto,
    })
  }

  @Delete('/:id/user/:userId')
  deleteSecretSantaUser(
    @Param('id') secretSantaId: string,
    @Param('userId') userId: string,
    @CurrentUser('id') currentUserId: string,
  ): Promise<void> {
    return this.secretSantaService.deleteSecretSantaUser({ secretSantaId, secretSantaUserId: userId, currentUserId })
  }
}
