import type { ICurrentUser, SecretSantaId } from '@wishlist/common';
import type { SecretSantaRepository } from '../../domain/repository/secret-santa.repository';
import type { SecretSantaUserRepository } from '../../domain/repository/secret-santa-user.repository';

import { Injectable } from '@znight/core';
import { EventPublisher } from '@znight/events';
import { ForbiddenException } from '@znight/http';
import { getLogger } from '@znight/observability';

import { TransactionManager } from '../../../core/database/transaction-manager';
import { type EventRepository } from '../../../event/domain/repository/event.repository';
import { SecretSantaCancelledEvent } from '../../domain/event/secret-santa-cancelled.event';

export type CancelSecretSantaInput = {
  currentUser: ICurrentUser;
  secretSantaId: SecretSantaId;
};

@Injectable()
export class CancelSecretSantaUseCase {
  private readonly logger = getLogger(CancelSecretSantaUseCase.name);

  constructor(
    private readonly secretSantaRepository: SecretSantaRepository,
    private readonly secretSantaUserRepository: SecretSantaUserRepository,
    private readonly eventRepository: EventRepository,
    private readonly transactionManager: TransactionManager,
    private readonly eventBus: EventPublisher,
  ) {}

  async execute(command: CancelSecretSantaInput): Promise<void> {
    this.logger.info('Cancel secret santa request received', { command });
    const secretSanta = await this.secretSantaRepository.findByIdOrFail(command.secretSantaId);
    const event = await this.eventRepository.findByIdOrFail(secretSanta.eventId);

    if (!event.canEdit(command.currentUser)) {
      throw new ForbiddenException('Event cannot be edited by this user');
    }

    const cancelledSecretSanta = secretSanta.cancel();

    this.logger.info('Saving secret santa...', { secretSantaId: secretSanta.id, cancelledSecretSanta });
    await this.transactionManager.runInTransaction(async tx => {
      await this.secretSantaRepository.save(cancelledSecretSanta, tx);
      await this.secretSantaUserRepository.saveAll(cancelledSecretSanta.users, tx);
    });

    const secretSantaAttendeeIds = cancelledSecretSanta.users.map(user => user.attendeeId);
    const attendeeEmails = event.attendees
      .filter(attendee => secretSantaAttendeeIds.includes(attendee.id))
      .map(attendee => attendee.getEmail());

    await this.eventBus.publish(
      new SecretSantaCancelledEvent({
        eventTitle: event.title,
        eventId: cancelledSecretSanta.eventId,
        attendeeEmails,
      }),
    );
  }
}
