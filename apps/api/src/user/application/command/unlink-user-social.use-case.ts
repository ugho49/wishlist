import { Inject, Logger, NotFoundException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { UnlinkUserSocialCommand, UpdateUserPictureFromSocialCommand, UserSocialRepository } from '../../domain'

@CommandHandler(UnlinkUserSocialCommand)
export class UnlinkUserSocialUseCase implements IInferredCommandHandler<UnlinkUserSocialCommand> {
  private readonly logger = new Logger(UnlinkUserSocialUseCase.name)

  constructor(
    @Inject(REPOSITORIES.USER_SOCIAL)
    private readonly userSocialRepository: UserSocialRepository,
  ) {}

  async execute(command: UpdateUserPictureFromSocialCommand): Promise<void> {
    this.logger.log('Unlink user social request received', { command })
    const { userId, socialId } = command

    const socials = await this.userSocialRepository.findByUserId(userId)
    const social = socials.find(s => s.id === socialId)

    if (!social) throw new NotFoundException('This social id does not exist')

    this.logger.log('Deleting user social...', { userId, socialId })
    await this.userSocialRepository.delete(socialId)
  }
}
