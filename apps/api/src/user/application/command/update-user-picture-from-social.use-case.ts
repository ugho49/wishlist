import { Inject, NotFoundException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { BucketService } from '@wishlist/api/core'
import { USER_REPOSITORY, USER_SOCIAL_REPOSITORY } from '@wishlist/api/repositories'

import { UpdateUserPictureFromSocialCommand, UserRepository, UserSocialRepository } from '../../domain'

@CommandHandler(UpdateUserPictureFromSocialCommand)
export class UpdateUserPictureFromSocialUseCase implements IInferredCommandHandler<UpdateUserPictureFromSocialCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(USER_SOCIAL_REPOSITORY)
    private readonly userSocialRepository: UserSocialRepository,
    private readonly bucketService: BucketService,
  ) {}

  async execute(command: UpdateUserPictureFromSocialCommand): Promise<void> {
    const { userId, socialId } = command

    const user = await this.userRepository.findByIdOrFail(userId)
    const socials = await this.userSocialRepository.findByUserId(userId)

    const social = socials.find(s => s.id === socialId)

    if (!social) throw new NotFoundException('This social id does not exist')

    if (user.pictureUrl) {
      await this.bucketService.removeIfExist({ destination: `pictures/${userId}/` }) // TODO: to be removed
      await this.bucketService.removeIfExist({ destination: `pictures/users/${userId}/` })
    }

    const updatedUser = user.updatePicture(social.pictureUrl)
    await this.userRepository.save(updatedUser)
  }
}
