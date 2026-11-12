import type { EventId } from '@wishlist/common';
import type { SecretSanta } from '../../domain/model/secret-santa.model';
import type { SecretSantaRepository } from '../../domain/repository/secret-santa.repository';

import { Injectable } from '@znight/core';

export type GetSecretSantasByEventIdsInput = {
  eventIds: EventId[];
};

@Injectable()
export class GetSecretSantasByEventIdsUseCase {
  constructor(private readonly secretSantaRepository: SecretSantaRepository) {}

  async execute(query: GetSecretSantasByEventIdsInput): Promise<Map<EventId, SecretSanta>> {
    const secretSantas = await this.secretSantaRepository.findByEventIds(query.eventIds);
    return new Map(secretSantas.map(secretSanta => [secretSanta.eventId, secretSanta]));
  }
}
