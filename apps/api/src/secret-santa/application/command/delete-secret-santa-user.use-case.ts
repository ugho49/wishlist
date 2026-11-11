import type { ICurrentUser, SecretSantaId, SecretSantaUserId } from '@wishlist/common';
import type { SecretSantaRepository } from '../../domain/repository/secret-santa.repository';
import type { SecretSantaUserRepository } from '../../domain/repository/secret-santa-user.repository';

import { Injectable } from '@znight/core';
import { ForbiddenException } from '@znight/http';
import { getLogger } from '@znight/observability';

import { type EventRepository } from '../../../event/domain/repository/event.repository';

export type DeleteSecretSantaUserInput = {
  currentUser: ICurrentUser;
  secretSantaId: SecretSantaId;
  secretSantaUserId: SecretSantaUserId;
};

@Injectable()
export class DeleteSecretSantaUserUseCase {
  private readonly logger = getLogger(DeleteSecretSantaUserUseCase.name);

  constructor(
    private readonly secretSantaRepository: SecretSantaRepository,
    private readonly secretSantaUserRepository: SecretSantaUserRepository,
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(command: DeleteSecretSantaUserInput): Promise<void> {
    this.logger.info('Delete secret santa user request received', { command });
    const secretSanta = await this.secretSantaRepository.findByIdOrFail(command.secretSantaId);
    const event = await this.eventRepository.findByIdOrFail(secretSanta.eventId);

    if (!event.canEdit(command.currentUser)) {
      throw new ForbiddenException('Event cannot be edited by this user');
    }

    if (secretSanta.isStarted()) {
      throw new ForbiddenException('Secret santa already started');
    }

    this.logger.info('Deleting secret santa user...', {
      secretSantaId: secretSanta.id,
      secretSantaUserId: command.secretSantaUserId,
    });
    await this.secretSantaUserRepository.delete(command.secretSantaUserId);
  }
}
