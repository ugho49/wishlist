import { Inject, NotFoundException } from '@nestjs/common'
import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { USER_EMAIL_SETTING_REPOSITORY } from '@wishlist/api/repositories'

import { GetUserEmailSettingQuery, GetUserEmailSettingResult, UserEmailSettingRepository } from '../../domain'
import { userEmailSettingMapper } from '../../infrastructure'

@QueryHandler(GetUserEmailSettingQuery)
export class GetUserEmailSettingUseCase implements IInferredQueryHandler<GetUserEmailSettingQuery> {
  constructor(
    @Inject(USER_EMAIL_SETTING_REPOSITORY)
    private readonly userEmailSettingRepository: UserEmailSettingRepository,
  ) {}

  async execute(query: GetUserEmailSettingQuery): Promise<GetUserEmailSettingResult> {
    const userEmailSetting = await this.userEmailSettingRepository.findByUserId(query.currentUser.id)

    if (!userEmailSetting) {
      throw new NotFoundException('User email setting not found')
    }

    return userEmailSettingMapper.toDto(userEmailSetting)
  }
}
