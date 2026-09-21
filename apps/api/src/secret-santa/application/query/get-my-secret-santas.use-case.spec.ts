import type { SecretSantaRepository } from '../../domain/repository/secret-santa.repository';

import { Logger } from '@nestjs/common';

import { SecretSantaBuilder } from '../../../../test-utils/builders/secret-santa.builder';
import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../../user/domain/model/user.model';
import { SecretSanta } from '../../domain/model/secret-santa.model';
import { GetMySecretSantasUseCase } from './get-my-secret-santas.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('GetMySecretSantasUseCase', () => {
  const secretSantaRepository = createMock<SecretSantaRepository>();

  let useCase: GetMySecretSantasUseCase;
  let user: User;
  let secretSanta: SecretSanta;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    user = new UserBuilder().withEmail('jean@test.fr').build();
    secretSanta = new SecretSantaBuilder().build();
    secretSantaRepository.findVisibleForUserPaginated.mockResolvedValue({
      secretSantas: [secretSanta],
      totalCount: 1,
    });

    useCase = new GetMySecretSantasUseCase(secretSantaRepository);
  });

  it('should return paginated secret santas for the participant', async () => {
    const result = await useCase.execute({ userId: user.id, pageNumber: 2, pageSize: 10 });

    expect(result).toEqual({ secretSantas: [secretSanta], totalCount: 1 });
    expect(secretSantaRepository.findVisibleForUserPaginated).toHaveBeenCalledWith({
      userId: user.id,
      pagination: { take: 10, skip: 10 },
    });
  });
});
