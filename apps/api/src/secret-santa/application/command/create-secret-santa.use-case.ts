import type { EventId, ICurrentUser } from '@wishlist/common';
import type { SecretSantaRepository } from '../../domain/repository/secret-santa.repository';

import { ConflictException, ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';

import { type EventRepository } from '../../../event/domain/repository/event.repository';
import { REPOSITORIES } from '../../../repositories/repositories.constants';
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
  private readonly logger = new Logger(CreateSecretSantaUseCase.name);

  constructor(
    @Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository,
    @Inject(REPOSITORIES.SECRET_SANTA) private readonly secretSantaRepository: SecretSantaRepository,
  ) {}

  async execute(command: CreateSecretSantaInput): Promise<CreateSecretSantaResult> {
    this.logger.log('Create secret santa request received', { command });
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

    this.logger.log('Saving secret santa...', { secretSantaId: secretSanta.id, secretSanta });
    await this.secretSantaRepository.save(secretSanta);

    return { secretSanta };
  }
}
