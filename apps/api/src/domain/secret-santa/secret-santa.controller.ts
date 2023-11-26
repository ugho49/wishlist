import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SecretSantaService } from './secret-santa.service';
import {
  CreateSecretSantaInputDto,
  CreateSecretSantaUserInputDto,
  SecretSantaDto,
  SecretSantaUserDto,
  UpdateSecretSantaInputDto,
  UpdateSecretSantaUserInputDto,
} from '@wishlist/common-types';
import { CurrentUser } from '../auth';

@ApiTags('Secret Santa')
@Controller('/secret-santa')
export class SecretSantaController {
  constructor(private readonly secretSantaService: SecretSantaService) {}

  @Get('/')
  getSecretSantaForEvent(
    @CurrentUser('id') currentUserId: string,
    @Query('eventId') eventId: string,
  ): Promise<SecretSantaDto | null> {
    return this.secretSantaService.getSecretSantaForEvent({ currentUserId, eventId });
  }

  @Post('/')
  createSecretSantaForEvent(
    @CurrentUser('id') currentUserId: string,
    @Body() dto: CreateSecretSantaInputDto,
  ): Promise<SecretSantaDto> {
    return this.secretSantaService.createSecretSantaForEvent({ currentUserId, dto });
  }

  @Put('/:id')
  updateSecretSanta(
    @Param('id') secretSantaId: string,
    @CurrentUser('id') currentUserId: string,
    @Body() dto: UpdateSecretSantaInputDto,
  ): Promise<SecretSantaDto> {
    return this.secretSantaService.updateSecretSanta({ secretSantaId, currentUserId, dto });
  }

  @Delete('/:id')
  deleteSecretSanta(@Param('id') secretSantaId: string, @CurrentUser('id') currentUserId: string): Promise<void> {
    return this.secretSantaService.deleteSecretSanta({ secretSantaId, currentUserId });
  }

  @Post('/:id/start')
  startSecretSanta(@Param('id') secretSantaId: string, @CurrentUser('id') currentUserId: string): Promise<void> {
    return this.secretSantaService.startSecretSanta({ secretSantaId, currentUserId });
  }

  @Post('/:id/cancel')
  cancelSecretSanta(@Param('id') secretSantaId: string, @CurrentUser('id') currentUserId: string): Promise<void> {
    return this.secretSantaService.cancelSecretSanta({ secretSantaId, currentUserId });
  }

  @Post('/:id/user')
  addSecretSantaUser(
    @Param('id') secretSantaId: string,
    @CurrentUser('id') currentUserId: string,
    @Body() dto: CreateSecretSantaUserInputDto,
  ): Promise<SecretSantaUserDto> {
    return this.secretSantaService.addSecretSantaUser({ secretSantaId, currentUserId, dto });
  }

  // Update secret santa user
  @Put('/:id/user/:userId')
  updateSecretSantaUser(
    @Param('id') secretSantaId: string,
    @Param('userId') userId: string,
    @CurrentUser('id') currentUserId: string,
    @Body() dto: UpdateSecretSantaUserInputDto,
  ): Promise<SecretSantaUserDto> {
    return this.secretSantaService.updateSecretSantaUser({ secretSantaId, userId, currentUserId, dto });
  }

  @Delete('/:id/user/:userId')
  deleteSecretSantaUser(
    @Param('id') secretSantaId: string,
    @Param('userId') userId: string,
    @CurrentUser('id') currentUserId: string,
  ): Promise<void> {
    return this.secretSantaService.deleteSecretSantaUser({ secretSantaId, userId, currentUserId });
  }
}
