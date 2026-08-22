import type { UserRepository } from '../../domain/repository/user.repository';

import { Inject, Injectable, Logger } from '@nestjs/common';
import { type UserId } from '@wishlist/common';

import { BucketService } from '../../../core/bucket/bucket.service';
import { REPOSITORIES } from '../../../repositories/repositories.constants';

export type RemoveUserPictureInput = {
  userId: UserId;
};

@Injectable()
export class RemoveUserPictureUseCase {
  private readonly logger = new Logger(RemoveUserPictureUseCase.name);

  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
    private readonly bucketService: BucketService,
  ) {}

  async execute(input: RemoveUserPictureInput): Promise<void> {
    this.logger.log('Remove user picture request received', { input });

    const { userId } = input;
    const user = await this.userRepository.findByIdOrFail(userId);

    this.logger.log('Removing user picture in bucket...', { userId });

    await this.bucketService.removeIfExist({ destination: `pictures/${userId}/` }); // TODO: to be removed
    await this.bucketService.removeIfExist({ destination: `pictures/users${userId}/` });

    const updatedUser = user.updatePicture(undefined);

    this.logger.log('Saving user...', { userId });
    await this.userRepository.save(updatedUser);
  }
}
