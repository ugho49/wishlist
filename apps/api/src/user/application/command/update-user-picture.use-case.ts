import { Inject, Logger } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { BucketService } from '@wishlist/api/core'
import { USER_REPOSITORY } from '@wishlist/api/repositories'
import { uuid } from '@wishlist/common'

import { UpdateUserPictureCommand, UpdateUserPictureResult, UserRepository } from '../../domain'

@CommandHandler(UpdateUserPictureCommand)
export class UpdateUserPictureUseCase implements IInferredCommandHandler<UpdateUserPictureCommand> {
  private readonly logger = new Logger(UpdateUserPictureUseCase.name)

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly bucketService: BucketService,
  ) {}

  async execute(command: UpdateUserPictureCommand): Promise<UpdateUserPictureResult> {
    const { userId, file } = command

    const user = await this.userRepository.findByIdOrFail(userId)

    try {
      await this.bucketService.removeIfExist({ destination: `pictures/${userId}/` }) // TODO: to be removed
      await this.bucketService.removeIfExist({ destination: `pictures/users/${userId}/` })
    } catch (e) {
      this.logger.error('Fail to delete existing picture for user', userId, e)
    }

    const publicUrl = await this.bucketService.upload({
      destination: `pictures/users/${userId}/${uuid()}`,
      data: file.buffer,
      contentType: file.mimetype,
    })

    const updatedUser = user.updatePicture(publicUrl)
    await this.userRepository.save(updatedUser)

    return { pictureUrl: publicUrl }
  }
}
