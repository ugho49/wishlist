import type { EventId, ICurrentUser } from '@wishlist/common';
import type { SecretSantaUserRepository } from '../../domain/repository/secret-santa-user.repository';

import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';

export type RevealSecretSantaDrawInput = {
  currentUser: ICurrentUser;
  eventId: EventId;
};

@Injectable()
export class RevealSecretSantaDrawUseCase {
  private readonly logger = new Logger(RevealSecretSantaDrawUseCase.name);

  constructor(
    @Inject(REPOSITORIES.SECRET_SANTA_USER) private readonly secretSantaUserRepository: SecretSantaUserRepository,
  ) {}

  async execute(input: RevealSecretSantaDrawInput): Promise<void> {
    this.logger.log('Reveal secret santa draw request received', {
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
