import type { ICurrentUser, SecretSantaId } from '@wishlist/common';
import type { SecretSantaRepository } from '../../domain/repository/secret-santa.repository';

import { Injectable } from '@znight/core';
import { ConflictException, ForbiddenException } from '@znight/http';
import { getLogger } from '@znight/observability';

import { type EventRepository } from '../../../event/domain/repository/event.repository';

export type UpdateSecretSantaInput = {
  currentUser: ICurrentUser;
  secretSantaId: SecretSantaId;
  description?: string;
  budget?: number;
};

@Injectable()
export class UpdateSecretSantaUseCase {
  private readonly logger = getLogger(UpdateSecretSantaUseCase.name);

  constructor(
    private readonly secretSantaRepository: SecretSantaRepository,
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(command: UpdateSecretSantaInput): Promise<void> {
    this.logger.info('Update secret santa request received', { command });
    const secretSanta = await this.secretSantaRepository.findByIdOrFail(command.secretSantaId);
    const event = await this.eventRepository.findByIdOrFail(secretSanta.eventId);

    if (!event.canEdit(command.currentUser)) {
      throw new ForbiddenException('Event cannot be edited by this user');
    }

    if (!secretSanta.canBeModified()) {
      throw new ConflictException('Secret santa already started');
    }

    const updatedSecretSanta = secretSanta.update({
      description: command.description,
      budget: command.budget,
    });

    this.logger.info('Saving secret santa...', { secretSantaId: secretSanta.id, updatedSecretSanta });
    await this.secretSantaRepository.save(updatedSecretSanta);
  }
}
