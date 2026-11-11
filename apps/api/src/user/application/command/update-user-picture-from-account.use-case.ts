import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserAccountRepository } from '../../domain/repository/user-account.repository';

import { type UserAccountId, type UserId } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { NotFoundException } from '@znight/http';
import { getLogger } from '@znight/observability';

import { BucketService } from '../../../core/bucket/bucket.service';
import { isSocialAccountProvider } from '../../domain/user-account-provider.enum';

export type UpdateUserPictureFromAccountInput = {
  userId: UserId;
  accountId: UserAccountId;
};

@Injectable()
export class UpdateUserPictureFromAccountUseCase {
  private readonly logger = getLogger(UpdateUserPictureFromAccountUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly userAccountRepository: UserAccountRepository,
    private readonly bucketService: BucketService,
  ) {}

  async execute(input: UpdateUserPictureFromAccountInput): Promise<void> {
    this.logger.info('Update user picture from account request received', { input });
    const { userId, accountId } = input;

    const user = await this.userRepository.findByIdOrFail(userId);
    const accounts = await this.userAccountRepository.findByUserId(userId);

    const account = accounts.find(item => item.id === accountId && isSocialAccountProvider(item.provider));

    if (!account) throw new NotFoundException('This account id does not exist');

    if (user.pictureUrl) {
      this.logger.info('Removing user picture in bucket...', { userId });
      await this.bucketService.removeIfExist({ destination: `pictures/${userId}/` }); // TODO: to be removed
      await this.bucketService.removeIfExist({ destination: `pictures/users/${userId}/` });
    }

    const updatedUser = user.updatePicture(account.pictureUrl);
    this.logger.info('Saving user...', { userId, updatedFields: ['pictureUrl'] });
    await this.userRepository.save(updatedUser);
  }
}
