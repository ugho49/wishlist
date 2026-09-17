import type { SecretSantaRepository } from '../../domain/repository/secret-santa.repository';

import { SecretSantaBuilder } from '../../../../test-utils/builders/secret-santa.builder';
import { createMock } from '../../../../test-utils/mocks';
import { GetSecretSantasByEventIdsUseCase } from './get-secret-santas-by-event-ids.use-case';
import { beforeEach, describe, expect, it, mock } from 'bun:test';

describe('GetSecretSantasByEventIdsUseCase', () => {
  const secretSantaRepository = createMock<SecretSantaRepository>();
  let useCase: GetSecretSantasByEventIdsUseCase;

  beforeEach(() => {
    mock.clearAllMocks();
    useCase = new GetSecretSantasByEventIdsUseCase(secretSantaRepository);
  });

  it('should map secret santas by event id', async () => {
    const first = new SecretSantaBuilder().build();
    const second = new SecretSantaBuilder().started().build();
    secretSantaRepository.findByEventIds.mockResolvedValueOnce([first, second]);

    const result = await useCase.execute({ eventIds: [first.eventId, second.eventId] });

    expect(result.get(first.eventId)).toBe(first);
    expect(result.get(second.eventId)).toBe(second);
    expect(secretSantaRepository.findByEventIds).toHaveBeenCalledWith([first.eventId, second.eventId]);
  });

  it('should return an empty map when no secret santa exists', async () => {
    secretSantaRepository.findByEventIds.mockResolvedValueOnce([]);

    const result = await useCase.execute({ eventIds: [] });

    expect(result.size).toBe(0);
  });
});
