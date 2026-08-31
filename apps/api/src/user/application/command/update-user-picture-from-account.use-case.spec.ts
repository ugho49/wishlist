import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserAccountRepository } from '../../domain/repository/user-account.repository';

import { Logger, NotFoundException } from '@nestjs/common';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { UserAccountBuilder } from '../../../../test-utils/builders/user-account.builder';
import { createMock } from '../../../../test-utils/mocks';
import { BucketService } from '../../../core/bucket/bucket.service';
import { User } from '../../domain/model/user.model';
import { UserAccount } from '../../domain/model/user-account.model';
import { UpdateUserPictureFromAccountUseCase } from './update-user-picture-from-account.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('UpdateUserPictureFromAccountUseCase', () => {
  const userRepository = createMock<UserRepository>();
  const userAccountRepository = createMock<UserAccountRepository>();
  const bucketService = createMock<BucketService>();

  let useCase: UpdateUserPictureFromAccountUseCase;
  let user: User;
  let account: UserAccount;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    user = new UserBuilder().withEmail('jean@test.fr').build();
    account = new UserAccountBuilder()
      .withUser(user)
      .withGoogle('google-123')
      .withPictureUrl('https://google/pic.png')
      .build();
    userRepository.findByIdOrFail.mockResolvedValue(user);
    userAccountRepository.findByUserId.mockResolvedValue([account]);

    useCase = new UpdateUserPictureFromAccountUseCase(userRepository, userAccountRepository, bucketService);
  });

  it('should reject when the account id does not exist', async () => {
    await expect(
      useCase.execute({
        userId: user.id,
        accountId: new UserAccountBuilder().withUser(user).build().id,
      }),
    ).rejects.toThrow(NotFoundException);
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when the account is a password account', async () => {
    const passwordAccount = new UserAccountBuilder().buildPassword(user, 'hash');
    userAccountRepository.findByUserId.mockResolvedValueOnce([passwordAccount]);

    await expect(useCase.execute({ userId: user.id, accountId: passwordAccount.id })).rejects.toThrow(
      NotFoundException,
    );
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should copy the account picture onto the user', async () => {
    await useCase.execute({ userId: user.id, accountId: account.id });

    expect(bucketService.removeIfExist).not.toHaveBeenCalled();
    expect(userRepository.save.mock.calls[0]?.[0]?.pictureUrl).toBe('https://google/pic.png');
  });

  it('should remove the existing picture from the bucket when the user already has one', async () => {
    const userWithPicture = user.updatePicture('https://cdn/old.png');
    userRepository.findByIdOrFail.mockResolvedValueOnce(userWithPicture);

    await useCase.execute({ userId: userWithPicture.id, accountId: account.id });

    expect(bucketService.removeIfExist).toHaveBeenCalledTimes(2);
    expect(userRepository.save).toHaveBeenCalledTimes(1);
  });
});
