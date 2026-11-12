import type { EventId, ICurrentUser } from '@wishlist/common';
import type { SecretSantaUserRepository } from '../../domain/repository/secret-santa-user.repository';

import { Injectable } from '@znight/core';
import { NotFoundException } from '@znight/http';
import { getLogger } from '@znight/observability';

export type RevealSecretSantaDrawInput = {
  currentUser: ICurrentUser;
  eventId: EventId;
};

@Injectable()
export class RevealSecretSantaDrawUseCase {
  private readonly logger = getLogger(RevealSecretSantaDrawUseCase.name);

  constructor(private readonly secretSantaUserRepository: SecretSantaUserRepository) {}

  async execute(input: RevealSecretSantaDrawInput): Promise<void> {
    this.logger.info('Reveal secret santa draw request received', {
      eventId: input.eventId,
      userId: input.currentUser.id,
    });

    const participant = await this.secretSantaUserRepository.findParticipantForEvent({
      eventId: input.eventId,
      userId: input.currentUser.id,
    });

    if (!participant?.hasDrawnUser()) {
      throw new NotFoundException('Secret santa draw not found');
    }

    const revealed = participant.revealDraw();

    if (revealed === participant) return;

    await this.secretSantaUserRepository.saveAll([revealed]);
  }
}
