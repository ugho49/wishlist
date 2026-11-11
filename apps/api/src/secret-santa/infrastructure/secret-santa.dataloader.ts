import type { BatchLoad } from '@znight/graphql';

import { type EventId } from '@wishlist/common';
import { Injectable } from '@znight/core';

import { type SecretSanta } from '../../gql/generated-types';
import { GetSecretSantasByEventIdsUseCase } from '../application/query/get-secret-santas-by-event-ids.use-case';
import { secretSantaMapper } from './secret-santa.mapper';

@Injectable()
export class SecretSantasByEventId implements BatchLoad<EventId, SecretSanta | null> {
  constructor(private readonly getSecretSantasByEventIdsUseCase: GetSecretSantasByEventIdsUseCase) {}

  async load(eventIds: readonly EventId[]): Promise<readonly (SecretSanta | null)[]> {
    const secretSantaByEventId = await this.getSecretSantasByEventIdsUseCase.execute({ eventIds: [...eventIds] });

    return eventIds.map(eventId => {
      const secretSanta = secretSantaByEventId.get(eventId);
      return secretSanta ? secretSantaMapper.toGqlSecretSanta(secretSanta) : null;
    });
  }
}
