import type { ICurrentUser, SecretSantaId, SecretSantaUserId } from '@wishlist/common';
import type { SecretSantaRepository } from '../../domain/repository/secret-santa.repository';
import type { SecretSantaUserRepository } from '../../domain/repository/secret-santa-user.repository';

import { Injectable } from '@znight/core';
import { BadRequestException, ForbiddenException } from '@znight/http';
import { getLogger } from '@znight/observability';

import { type EventRepository } from '../../../event/domain/repository/event.repository';

export type UpdateSecretSantaUserInput = {
  currentUser: ICurrentUser;
  secretSantaId: SecretSantaId;
  secretSantaUserId: SecretSantaUserId;
  exclusions: SecretSantaUserId[];
};

@Injectable()
export class UpdateSecretSantaUserUseCase {
  private readonly logger = getLogger(UpdateSecretSantaUserUseCase.name);

  constructor(
    private readonly secretSantaRepository: SecretSantaRepository,
    private readonly secretSantaUserRepository: SecretSantaUserRepository,
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(command: UpdateSecretSantaUserInput): Promise<void> {
    this.logger.info('Update secret santa user request received', { command });
    const secretSanta = await this.secretSantaRepository.findByIdOrFail(command.secretSantaId);
    const event = await this.eventRepository.findByIdOrFail(secretSanta.eventId);

    if (!event.canEdit(command.currentUser)) {
      throw new ForbiddenException('Event cannot be edited by this user');
    }

    if (!secretSanta.canBeModified()) {
      throw new ForbiddenException('Secret santa already started');
    }

    if (command.exclusions.includes(command.secretSantaUserId)) {
      throw new BadRequestException('Secret santa user cannot exclude himself');
    }

    const updatedSecretSanta = secretSanta.updateUserExclusions(command.secretSantaUserId, command.exclusions);
    this.logger.info('Saving secret santa users...', { secretSantaId: secretSanta.id, updatedSecretSanta });
    await this.secretSantaUserRepository.saveAll(updatedSecretSanta);
  }
}
