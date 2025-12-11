import { Inject, Logger, NotFoundException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { BucketService } from '@wishlist/api/core'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { UpdateUserPictureFromSocialCommand, UserRepository, UserSocialRepository } from '../../domain'

@CommandHandler(UpdateUserPictureFromSocialCommand)
export class UpdateUserPictureFromSocialUseCase implements IInferredCommandHandler<UpdateUserPictureFromSocialCommand> {
  private readonly logger = new Logger(UpdateUserPictureFromSocialUseCase.name)

  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
    @Inject(REPOSITORIES.USER_SOCIAL)
    private readonly userSocialRepository: UserSocialRepository,
    private readonly bucketService: BucketService,
  ) {}

  async execute(command: UpdateUserPictureFromSocialCommand): Promise<void> {
    this.logger.log('Update user picture from social request received', { command })
    const { userId, socialId } = command

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
