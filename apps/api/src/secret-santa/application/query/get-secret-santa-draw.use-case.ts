import type { EventId, ICurrentUser } from '@wishlist/common';
import type { EventAttendee } from '../../../event/domain/model/event-attendee.model';
import type { SecretSantaUserRepository } from '../../domain/repository/secret-santa-user.repository';

import { Inject, Injectable } from '@nestjs/common';

import { type EventAttendeeRepository } from '../../../event/domain/repository/event-attendee.repository';
import { REPOSITORIES } from '../../../repositories/repositories.constants';

export type GetSecretSantaDrawInput = {
  currentUser: ICurrentUser;
  eventId: EventId;
};

export type GetSecretSantaDrawResult = {
  attendee: EventAttendee | undefined;
};

@Injectable()
export class GetSecretSantaDrawUseCase {
  constructor(
    @Inject(REPOSITORIES.SECRET_SANTA_USER) private readonly secretSantaUserRepository: SecretSantaUserRepository,
    @Inject(REPOSITORIES.EVENT_ATTENDEE) private readonly attendeeRepository: EventAttendeeRepository,
  ) {}

  async execute(query: GetSecretSantaDrawInput): Promise<GetSecretSantaDrawResult> {
    const secretSantaUser = await this.secretSantaUserRepository.findDrawSecretSantaUserForEvent({
      eventId: query.eventId,
      userId: query.currentUser.id,
    });

    if (!secretSantaUser) return { attendee: undefined };

    const attendee = await this.attendeeRepository.findById(secretSantaUser.attendeeId);

    return { attendee };
  }
}
