import type { UserRepository } from '../../domain/repository/user.repository';

import { Logger } from '@nestjs/common';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { BucketService } from '../../../core/bucket/bucket.service';
import { User } from '../../domain/model/user.model';
import { RemoveUserPictureUseCase } from './remove-user-picture.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('RemoveUserPictureUseCase', () => {
  const userRepository = createMock<UserRepository>();
  const bucketService = createMock<BucketService>();

  let useCase: RemoveUserPictureUseCase;
  let user: User;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    user = new UserBuilder().withEmail('jean@test.fr').build();
    userRepository.findByIdOrFail.mockResolvedValue(user);

    useCase = new RemoveUserPictureUseCase(userRepository, bucketService);
  });

  it('should remove pictures from the bucket and persist the user without a picture', async () => {
    await useCase.execute({ userId: user.id });

    expect(bucketService.removeIfExist).toHaveBeenCalledTimes(2);
    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(userRepository.save.mock.calls[0]?.[0]?.pictureUrl).toBeUndefined();
  });
});
