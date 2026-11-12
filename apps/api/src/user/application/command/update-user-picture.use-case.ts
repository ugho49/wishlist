import type { UserRepository } from '../../domain/repository/user.repository';

import { type UserId, uuid } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { getLogger } from '@znight/observability';

import { BucketService } from '../../../core/bucket/bucket.service';

export type UpdateUserPictureResult = {
  pictureUrl: string;
};

export type UpdateUserPictureInput = {
  userId: UserId;
  file: File;
};

@Injectable()
export class UpdateUserPictureUseCase {
  private readonly logger = getLogger(UpdateUserPictureUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly bucketService: BucketService,
  ) {}

  async execute(command: UpdateUserPictureInput): Promise<UpdateUserPictureResult> {
    this.logger.info('Update user picture request received', { command });
    const { userId, file } = command;

    const user = await this.userRepository.findByIdOrFail(userId);

    try {
      this.logger.info('Removing user picture in bucket...', { userId });
      await this.bucketService.removeIfExist({ destination: `pictures/${userId}/` }); // TODO: to be removed
      await this.bucketService.removeIfExist({ destination: `pictures/users/${userId}/` });
    } catch (e) {
      this.logger.error('Fail to delete existing picture for user', { userId, error: e });
    }

    const publicUrl = await this.bucketService.upload({
      destination: `pictures/users/${userId}/${uuid()}`,
      data: Buffer.from(await file.arrayBuffer()),
      contentType: file.type,
    });

    const updatedUser = user.updatePicture(publicUrl);
    this.logger.info('Saving user...', { userId, updatedFields: ['pictureUrl'] });
    await this.userRepository.save(updatedUser);

    return { pictureUrl: publicUrl };
  }
}
