import type { ICurrentUser, SecretSantaId } from '@wishlist/common';
import type { SecretSantaRepository } from '../../domain/repository/secret-santa.repository';
import type { SecretSantaUserRepository } from '../../domain/repository/secret-santa-user.repository';

import { Injectable } from '@znight/core';
import { EventPublisher } from '@znight/events';
import { BadRequestException, ForbiddenException } from '@znight/http';
import { getLogger } from '@znight/observability';

import { TransactionManager } from '../../../core/database/transaction-manager';
import { type EventRepository } from '../../../event/domain/repository/event.repository';
import { SecretSantaStartedEvent } from '../../domain/event/secret-santa-started.event';

export type StartSecretSantaInput = {
  currentUser: ICurrentUser;
  secretSantaId: SecretSantaId;
};

@Injectable()
export class StartSecretSantaUseCase {
  private readonly logger = getLogger(StartSecretSantaUseCase.name);

  constructor(
    private readonly secretSantaRepository: SecretSantaRepository,
    private readonly secretSantaUserRepository: SecretSantaUserRepository,
    private readonly eventRepository: EventRepository,
    private readonly eventBus: EventPublisher,
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(command: StartSecretSantaInput): Promise<void> {
    this.logger.info('Start secret santa request received', { command });
    let secretSanta = await this.secretSantaRepository.findByIdOrFail(command.secretSantaId);

    const event = await this.eventRepository.findByIdOrFail(secretSanta.eventId);

    if (!event.canEdit(command.currentUser)) {
      throw new ForbiddenException('Event cannot be edited by this user');
    }

    if (secretSanta.isStarted()) {
      throw new ForbiddenException('Secret santa already started');
    }

    if (event.isFinished()) {
      throw new BadRequestException('Event is already finished');
    }

    try {
      this.logger.info('Starting secret santa and assigning draw...', { secretSantaId: secretSanta.id });
      secretSanta = secretSanta.startAndAssignDraw();
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : String(error), undefined, {
        cause: error,
      });
    }

    this.logger.info('Saving secret santa...', { secretSantaId: secretSanta.id, secretSanta });
    await this.transactionManager.runInTransaction(async tx => {
      await this.secretSantaUserRepository.saveAll(secretSanta.users, tx);
      await this.secretSantaRepository.save(secretSanta, tx);
    });

    const drawns = secretSanta.users.flatMap(user => {
      const attendee = event.attendees.find(a => a.id === user.attendeeId);
      return attendee ? [{ email: attendee.getEmail() }] : [];
    });

    await this.eventBus.publish(
      new SecretSantaStartedEvent({
        eventTitle: event.title,
        eventId: event.id,
        budget: secretSanta.budget ?? undefined,
        description: secretSanta.description ?? undefined,
        drawns,
      }),
    );
  }
}
