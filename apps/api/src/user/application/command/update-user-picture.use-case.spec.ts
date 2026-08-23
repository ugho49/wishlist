import type { UserRepository } from '../../domain/repository/user.repository';

import { Logger } from '@nestjs/common';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { BucketService } from '../../../core/bucket/bucket.service';
import { User } from '../../domain/model/user.model';
import { UpdateUserPictureUseCase } from './update-user-picture.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('UpdateUserPictureUseCase', () => {
  const userRepository = createMock<UserRepository>();
  const bucketService = createMock<BucketService>();

  let useCase: UpdateUserPictureUseCase;
  let user: User;
  const file = { buffer: Buffer.from('img'), mimetype: 'image/png' } as Express.Multer.File;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    user = new UserBuilder().withEmail('jean@test.fr').build();
    userRepository.findByIdOrFail.mockResolvedValue(user);
    bucketService.upload.mockResolvedValue('https://cdn/picture.png');

    useCase = new UpdateUserPictureUseCase(userRepository, bucketService);
  });

  it('should upload the picture and persist the public url', async () => {
    const result = await useCase.execute({ userId: user.id, file });

    expect(result.pictureUrl).toBe('https://cdn/picture.png');
    expect(bucketService.upload).toHaveBeenCalledTimes(1);
    expect(userRepository.save.mock.calls[0]?.[0]?.pictureUrl).toBe('https://cdn/picture.png');
  });

  it('should still upload when removing the existing picture fails', async () => {
    bucketService.removeIfExist.mockRejectedValueOnce(new Error('bucket down'));

    const result = await useCase.execute({ userId: user.id, file });

    expect(result.pictureUrl).toBe('https://cdn/picture.png');
    expect(userRepository.save).toHaveBeenCalledTimes(1);
  });
});
