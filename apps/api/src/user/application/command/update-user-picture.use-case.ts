import { Inject, Injectable, Logger } from '@nestjs/common'
import { BucketService } from '@wishlist/api/core'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { UserId, uuid } from '@wishlist/common'

import { UserRepository } from '../../domain'

export type UpdateUserPictureResult = {
  pictureUrl: string
}

export type UpdateUserPictureInput = {
  userId: UserId
  file: Express.Multer.File
}

@Injectable()
export class UpdateUserPictureUseCase {
  private readonly logger = new Logger(UpdateUserPictureUseCase.name)

  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
    private readonly bucketService: BucketService,
  ) {}

  async execute(command: UpdateUserPictureInput): Promise<UpdateUserPictureResult> {
    this.logger.log('Update user picture request received', { command })
    const { userId, file } = command

    const user = await this.userRepository.findByIdOrFail(userId)

    try {
      this.logger.log('Removing user picture in bucket...', { userId })
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
    this.logger.log('Saving user...', { userId, updatedFields: ['pictureUrl'] })
    await this.userRepository.save(updatedUser)

    return { pictureUrl: publicUrl }
  }
}
