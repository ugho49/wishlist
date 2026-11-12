import type { UserRepository } from '../../domain/repository/user.repository';

import { type UserId } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { getLogger } from '@znight/observability';

import { BucketService } from '../../../core/bucket/bucket.service';

export type RemoveUserPictureInput = {
  userId: UserId;
};

@Injectable()
export class RemoveUserPictureUseCase {
  private readonly logger = getLogger(RemoveUserPictureUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly bucketService: BucketService,
  ) {}

  async execute(input: RemoveUserPictureInput): Promise<void> {
    this.logger.info('Remove user picture request received', { input });

    const { userId } = input;
    const user = await this.userRepository.findByIdOrFail(userId);

    this.logger.info('Removing user picture in bucket...', { userId });

    await this.bucketService.removeIfExist({ destination: `pictures/${userId}/` }); // TODO: to be removed
    await this.bucketService.removeIfExist({ destination: `pictures/users${userId}/` });

    const updatedUser = user.updatePicture(undefined);

    this.logger.info('Saving user...', { userId });
    await this.userRepository.save(updatedUser);
  }
}
