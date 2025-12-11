import { Inject, Logger } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { BucketService } from '@wishlist/api/core'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { RemoveUserPictureCommand, UserRepository } from '../../domain'

@CommandHandler(RemoveUserPictureCommand)
export class RemoveUserPictureUseCase implements IInferredCommandHandler<RemoveUserPictureCommand> {
  private readonly logger = new Logger(RemoveUserPictureUseCase.name)

  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
    private readonly bucketService: BucketService,
  ) {}

  async execute(command: RemoveUserPictureCommand): Promise<void> {
    this.logger.log('Remove user picture request received', { command })

    const { userId } = command
    const user = await this.userRepository.findByIdOrFail(userId)

    this.logger.log('Removing user picture in bucket...', { userId })

    await this.bucketService.removeIfExist({ destination: `pictures/${userId}/` }) // TODO: to be removed
    await this.bucketService.removeIfExist({ destination: `pictures/users${userId}/` })

    const updatedUser = user.updatePicture(undefined)

    this.logger.log('Saving user...', { userId })
    await this.userRepository.save(updatedUser)
  }
}
