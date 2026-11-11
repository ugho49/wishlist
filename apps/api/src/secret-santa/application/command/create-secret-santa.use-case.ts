import type { EventId, ICurrentUser } from '@wishlist/common';
import type { SecretSantaRepository } from '../../domain/repository/secret-santa.repository';

import { Injectable } from '@znight/core';
import { ConflictException, ForbiddenException } from '@znight/http';
import { getLogger } from '@znight/observability';

import { type EventRepository } from '../../../event/domain/repository/event.repository';
import { SecretSanta } from '../../domain/model/secret-santa.model';

export type CreateSecretSantaInput = {
  currentUser: ICurrentUser;
  eventId: EventId;
  description?: string;
  budget?: number;
};

export type CreateSecretSantaResult = {
  secretSanta: SecretSanta;
};

@Injectable()
export class CreateSecretSantaUseCase {
  private readonly logger = getLogger(CreateSecretSantaUseCase.name);

  constructor(
    private readonly eventRepository: EventRepository,
    private readonly secretSantaRepository: SecretSantaRepository,
  ) {}

  async execute(command: CreateSecretSantaInput): Promise<CreateSecretSantaResult> {
    this.logger.info('Create secret santa request received', { command });
    const alreadyExists = await this.secretSantaRepository.existsForEvent(command.eventId);

    if (alreadyExists) {
      throw new ConflictException('Secret santa already exists for event');
    }

    const event = await this.eventRepository.findByIdOrFail(command.eventId);

    if (!event.canEdit(command.currentUser)) {
      throw new ForbiddenException('Event cannot be edited by this user');
    }

    const secretSanta = SecretSanta.create({
      id: this.secretSantaRepository.newId(),
      eventId: command.eventId,
      budget: command.budget,
      description: command.description,
    });

    this.logger.info('Saving secret santa...', { secretSantaId: secretSanta.id, secretSanta });
    await this.secretSantaRepository.save(secretSanta);

    return { secretSanta };
  }
}
