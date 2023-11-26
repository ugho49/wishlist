import { Injectable } from '@nestjs/common';
import { EventRepository } from '../event/event.repository';
import { SecretSantaRepository, SecretSantaUserRepository } from './secret-santa.repository';
import {
  CreateSecretSantaInputDto,
  CreateSecretSantaUserInputDto,
  SecretSantaDto,
  SecretSantaUserDto,
  UpdateSecretSantaInputDto,
  UpdateSecretSantaUserInputDto,
} from '@wishlist/common-types';

@Injectable()
export class SecretSantaService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly secretSantaRepository: SecretSantaRepository,
    private readonly secretSantaUserRepository: SecretSantaUserRepository,
  ) {}

  async getSecretSantaForEvent(param: { eventId: string; currentUserId: string }): Promise<SecretSantaDto | null> {
    throw new Error('Not implemented');
  }

  async createSecretSantaForEvent(param: {
    currentUserId: string;
    dto: CreateSecretSantaInputDto;
  }): Promise<SecretSantaDto> {
    throw new Error('Not implemented');
  }

  async updateSecretSanta(param: {
    currentUserId: string;
    secretSantaId: string;
    dto: UpdateSecretSantaInputDto;
  }): Promise<SecretSantaDto> {
    throw new Error('Not implemented');
  }

  async deleteSecretSanta(param: { currentUserId: string; secretSantaId: string }): Promise<void> {
    throw new Error('Not implemented');
  }

  async startSecretSanta(param: { currentUserId: string; secretSantaId: string }): Promise<void> {
    throw new Error('Not implemented');
  }

  async cancelSecretSanta(param: { currentUserId: string; secretSantaId: string }): Promise<void> {
    throw new Error('Not implemented');
  }

  async addSecretSantaUser(param: {
    currentUserId: string;
    secretSantaId: string;
    dto: CreateSecretSantaUserInputDto;
  }): Promise<SecretSantaUserDto> {
    throw new Error('Not implemented');
  }

  async deleteSecretSantaUser(param: { currentUserId: string; secretSantaId: string; userId: string }): Promise<void> {
    throw new Error('Not implemented');
  }

  async updateSecretSantaUser(param: {
    currentUserId: string;
    secretSantaId: string;
    userId: string;
    dto: UpdateSecretSantaUserInputDto;
  }): Promise<SecretSantaUserDto> {
    throw new Error('Not implemented');
  }
}
