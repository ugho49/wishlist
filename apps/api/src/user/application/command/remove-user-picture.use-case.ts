import { Inject } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { BucketService } from '@wishlist/api/core'
import { USER_REPOSITORY } from '@wishlist/api/repositories'

import { RemoveUserPictureCommand, UserRepository } from '../../domain'

@CommandHandler(RemoveUserPictureCommand)
export class RemoveUserPictureUseCase implements IInferredCommandHandler<RemoveUserPictureCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly bucketService: BucketService,
  ) {}

  async execute(command: RemoveUserPictureCommand): Promise<void> {
    const { userId } = command
    const user = await this.userRepository.findByIdOrFail(userId)

    await this.bucketService.removeIfExist({ destination: `pictures/${userId}/` }) // TODO: to be removed
    await this.bucketService.removeIfExist({ destination: `pictures/users${userId}/` })

    const updatedUser = user.updatePicture(undefined)
    await this.userRepository.save(updatedUser)
  }
}
