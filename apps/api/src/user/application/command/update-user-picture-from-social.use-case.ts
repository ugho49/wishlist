import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { BucketService } from '@wishlist/api/core'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { UserId, UserSocialId } from '@wishlist/common'

import { UserRepository, UserSocialRepository } from '../../domain'

export type UpdateUserPictureFromSocialInput = {
  userId: UserId
  socialId: UserSocialId
}

@Injectable()
export class UpdateUserPictureFromSocialUseCase {
  private readonly logger = new Logger(UpdateUserPictureFromSocialUseCase.name)

  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
    @Inject(REPOSITORIES.USER_SOCIAL)
    private readonly userSocialRepository: UserSocialRepository,
    private readonly bucketService: BucketService,
  ) {}

  async execute(input: UpdateUserPictureFromSocialInput): Promise<void> {
    this.logger.log('Update user picture from social request received', { input })
    const { userId, socialId } = input

    const user = await this.userRepository.findByIdOrFail(userId)
    const socials = await this.userSocialRepository.findByUserId(userId)

    const social = socials.find(s => s.id === socialId)

    if (!social) throw new NotFoundException('This social id does not exist')

    if (user.pictureUrl) {
      this.logger.log('Removing user picture in bucket...', { userId })
      await this.bucketService.removeIfExist({ destination: `pictures/${userId}/` }) // TODO: to be removed
      await this.bucketService.removeIfExist({ destination: `pictures/users/${userId}/` })
    }

    const updatedUser = user.updatePicture(social.pictureUrl)
    this.logger.log('Saving user...', { userId, updatedFields: ['pictureUrl'] })
    await this.userRepository.save(updatedUser)
  }
}
