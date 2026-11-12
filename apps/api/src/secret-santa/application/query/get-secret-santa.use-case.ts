import type { EventId, ICurrentUser } from '@wishlist/common';
import type { SecretSanta } from '../../domain/model/secret-santa.model';
import type { SecretSantaRepository } from '../../domain/repository/secret-santa.repository';

import { Injectable } from '@znight/core';
import { ForbiddenException } from '@znight/http';

import { type EventRepository } from '../../../event/domain/repository/event.repository';

export type GetSecretSantaInput = {
  currentUser: ICurrentUser;
  eventId: EventId;
};

export type GetSecretSantaResult = {
  secretSanta: SecretSanta | undefined;
};

@Injectable()
export class GetSecretSantaUseCase {
  constructor(
    private readonly secretSantaRepository: SecretSantaRepository,
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(query: GetSecretSantaInput): Promise<GetSecretSantaResult> {
    const secretSanta = await this.secretSantaRepository.findForEvent({
      eventId: query.eventId,
    });

    if (!secretSanta) return { secretSanta: undefined };

    const event = await this.eventRepository.findByIdOrFail(query.eventId);

    if (!event.canView(query.currentUser)) {
      throw new ForbiddenException('Event cannot be viewed by this user');
    }

    return { secretSanta };
  }
}
