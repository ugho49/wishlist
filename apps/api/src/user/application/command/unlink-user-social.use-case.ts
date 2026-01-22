import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { UserId, UserSocialId } from '@wishlist/common'

import { UserSocialRepository } from '../../domain'

export type UnlinkUserSocialInput = {
  userId: UserId
  socialId: UserSocialId
}

@Injectable()
export class UnlinkUserSocialUseCase {
  private readonly logger = new Logger(UnlinkUserSocialUseCase.name)

  constructor(
    @Inject(REPOSITORIES.USER_SOCIAL)
    private readonly userSocialRepository: UserSocialRepository,
  ) {}

  async execute(input: UnlinkUserSocialInput): Promise<void> {
    this.logger.log('Unlink user social request received', { input })
    const { userId, socialId } = input

    const socials = await this.userSocialRepository.findByUserId(userId)
    const social = socials.find(s => s.id === socialId)

    if (!social) throw new NotFoundException('This social id does not exist')

    this.logger.log('Deleting user social...', { userId, socialId })
    await this.userSocialRepository.delete(socialId)
  }
}
