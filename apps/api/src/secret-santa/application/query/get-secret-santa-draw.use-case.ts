import type { EventId, ICurrentUser } from '@wishlist/common';
import type { EventAttendee } from '../../../event/domain/model/event-attendee.model';
import type { SecretSantaUserRepository } from '../../domain/repository/secret-santa-user.repository';

import { Injectable } from '@znight/core';

import { type EventAttendeeRepository } from '../../../event/domain/repository/event-attendee.repository';

export type GetSecretSantaDrawInput = {
  currentUser: ICurrentUser;
  eventId: EventId;
};

export type GetSecretSantaDrawResult = {
  attendee: EventAttendee | undefined;
  revealed: boolean;
};

@Injectable()
export class GetSecretSantaDrawUseCase {
  constructor(
    private readonly secretSantaUserRepository: SecretSantaUserRepository,
    private readonly attendeeRepository: EventAttendeeRepository,
  ) {}

  async execute(query: GetSecretSantaDrawInput): Promise<GetSecretSantaDrawResult> {
    const participant = await this.secretSantaUserRepository.findParticipantForEvent({
      eventId: query.eventId,
      userId: query.currentUser.id,
    });

    if (!participant?.drawUserId) return { attendee: undefined, revealed: false };

    const drawnUser = await this.secretSantaUserRepository.findById(participant.drawUserId);

    if (!drawnUser) return { attendee: undefined, revealed: false };

    const attendee = await this.attendeeRepository.findById(drawnUser.attendeeId);

    if (!attendee) return { attendee: undefined, revealed: false };

    return { attendee, revealed: participant.hasRevealedDraw() };
  }
}
