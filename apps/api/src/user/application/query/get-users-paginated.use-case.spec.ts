import type { UserRepository } from '../../domain/repository/user.repository';

import { BadRequestException, Logger } from '@nestjs/common';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../domain/model/user.model';
import { GetUsersPaginatedUseCase } from './get-users-paginated.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('GetUsersPaginatedUseCase', () => {
  const userRepository = createMock<UserRepository>();

  let useCase: GetUsersPaginatedUseCase;
  let user: User;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    user = new UserBuilder().withEmail('jean@test.fr').build();
    userRepository.findAllPaginated.mockResolvedValue({ users: [user], totalCount: 1 });

    useCase = new GetUsersPaginatedUseCase(userRepository);
  });

  it('should reject when the criteria is shorter than 2 characters', async () => {
    await expect(useCase.execute({ criteria: 'a', pageNumber: 1, pageSize: 10 })).rejects.toThrow(BadRequestException);
    expect(userRepository.findAllPaginated).not.toHaveBeenCalled();
  });

  it('should return paginated users without criteria', async () => {
    const result = await useCase.execute({ pageNumber: 2, pageSize: 10 });

    expect(result).toEqual({ users: [user], totalCount: 1 });
    expect(userRepository.findAllPaginated).toHaveBeenCalledWith({
      criteria: undefined,
      pagination: { take: 10, skip: 10 },
    });
  });

  it('should return paginated users matching the criteria', async () => {
    const result = await useCase.execute({ criteria: 'je', pageNumber: 1, pageSize: 20 });

    expect(result).toEqual({ users: [user], totalCount: 1 });
    expect(userRepository.findAllPaginated).toHaveBeenCalledWith({
      criteria: 'je',
      pagination: { take: 20, skip: 0 },
    });
  });
});
