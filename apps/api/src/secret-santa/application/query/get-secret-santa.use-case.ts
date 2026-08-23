import type { EventId, ICurrentUser } from '@wishlist/common';
import type { SecretSanta } from '../../domain/model/secret-santa.model';
import type { SecretSantaRepository } from '../../domain/repository/secret-santa.repository';

import { ForbiddenException, Inject, Injectable } from '@nestjs/common';

import { type EventRepository } from '../../../event/domain/repository/event.repository';
import { REPOSITORIES } from '../../../repositories/repositories.constants';

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
    @Inject(REPOSITORIES.SECRET_SANTA) private readonly secretSantaRepository: SecretSantaRepository,
    @Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository,
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
