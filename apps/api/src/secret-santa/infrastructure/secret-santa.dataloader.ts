import { Injectable } from '@nestjs/common';
import { type EventId } from '@wishlist/common';
import DataLoader from 'dataloader';

import { type SecretSanta } from '../../gql/generated-types';
import { GetSecretSantasByEventIdsUseCase } from '../application/query/get-secret-santas-by-event-ids.use-case';
import { secretSantaMapper } from './secret-santa.mapper';

@Injectable()
export class SecretSantaDataLoaderFactory {
  constructor(private readonly getSecretSantasByEventIdsUseCase: GetSecretSantasByEventIdsUseCase) {}

  createByEventLoader() {
    return new DataLoader<EventId, SecretSanta | null>(async (eventIds: readonly EventId[]) => {
      const secretSantaByEventId = await this.getSecretSantasByEventIdsUseCase.execute({
        eventIds: [...eventIds],
      });

      return eventIds.map(eventId => {
        const secretSanta = secretSantaByEventId.get(eventId);
        return secretSanta ? secretSantaMapper.toGqlSecretSanta(secretSanta) : null;
      });
    });
  }
}
