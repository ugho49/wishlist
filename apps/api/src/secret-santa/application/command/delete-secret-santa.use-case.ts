import type { ICurrentUser, SecretSantaId } from '@wishlist/common';
import type { SecretSantaRepository } from '../../domain/repository/secret-santa.repository';

import { Injectable } from '@znight/core';
import { ForbiddenException } from '@znight/http';
import { getLogger } from '@znight/observability';

import { type EventRepository } from '../../../event/domain/repository/event.repository';

export type DeleteSecretSantaInput = {
  currentUser: ICurrentUser;
  secretSantaId: SecretSantaId;
};

@Injectable()
export class DeleteSecretSantaUseCase {
  private readonly logger = getLogger(DeleteSecretSantaUseCase.name);

  constructor(
    private readonly secretSantaRepository: SecretSantaRepository,
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(command: DeleteSecretSantaInput): Promise<void> {
    this.logger.info('Delete secret santa request received', { command });
    const secretSanta = await this.secretSantaRepository.findByIdOrFail(command.secretSantaId);
    const event = await this.eventRepository.findByIdOrFail(secretSanta.eventId);

    if (!event.canEdit(command.currentUser)) {
      throw new ForbiddenException('Event cannot be edited by this user');
    }

    if (secretSanta.isStarted()) {
      throw new ForbiddenException('Secret santa already started, it needs to be cancelled first');
    }

    this.logger.info('Deleting secret santa...', { secretSantaId: secretSanta.id });
    await this.secretSantaRepository.delete(secretSanta.id);
  }
}
