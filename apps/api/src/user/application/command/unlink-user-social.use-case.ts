import { Inject, NotFoundException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { UnlinkUserSocialCommand, UpdateUserPictureFromSocialCommand, UserSocialRepository } from '../../domain'

@CommandHandler(UnlinkUserSocialCommand)
export class UnlinkUserSocialUseCase implements IInferredCommandHandler<UnlinkUserSocialCommand> {
  constructor(
    @Inject(REPOSITORIES.USER_SOCIAL)
    private readonly userSocialRepository: UserSocialRepository,
  ) {}

  async execute(command: UpdateUserPictureFromSocialCommand): Promise<void> {
    const { userId, socialId } = command

    const socials = await this.userSocialRepository.findByUserId(userId)
    const social = socials.find(s => s.id === socialId)

    if (!social) throw new NotFoundException('This social id does not exist')

    await this.userSocialRepository.delete(socialId)
  }
}
