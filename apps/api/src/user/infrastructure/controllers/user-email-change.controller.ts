import { Body, Controller, Get, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CurrentUser, Public } from '@wishlist/api/auth'
import {
  ConfirmEmailChangeInputDto,
  type ICurrentUser,
  type PendingEmailChangeDto,
  RequestEmailChangeInputDto,
} from '@wishlist/common'

import { ConfirmEmailChangeUseCase } from '../../application/command/confirm-email-change.use-case'
import { CreateEmailChangeVerificationUseCase } from '../../application/command/create-email-change-verification.use-case'
import { GetPendingEmailChangeUseCase } from '../../application/query/get-pending-email-change.use-case'

@ApiTags('User Email Change')
@Controller('/user/email-change')
export class UserEmailChangeController {
  constructor(
    private readonly createEmailChangeVerificationUseCase: CreateEmailChangeVerificationUseCase,
    private readonly confirmEmailChangeUseCase: ConfirmEmailChangeUseCase,
    private readonly getPendingEmailChangeUseCase: GetPendingEmailChangeUseCase,
  ) {}

  @Get('/pending')
  async getPendingEmailChange(@CurrentUser() currentUser: ICurrentUser): Promise<PendingEmailChangeDto | undefined> {
    const result = await this.getPendingEmailChangeUseCase.execute({ currentUser })

    if (!result) {
      return undefined
    }

    return {
      new_email: result.newEmail,
      expired_at: result.expiredAt,
    }
  }

  @Post('/request')
  async requestEmailChange(
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: RequestEmailChangeInputDto,
  ): Promise<void> {
    await this.createEmailChangeVerificationUseCase.execute({
      currentUser,
      newEmail: dto.new_email,
    })
  }

  @Public()
  @Post('/confirm')
  async confirmEmailChange(@Body() dto: ConfirmEmailChangeInputDto): Promise<void> {
    await this.confirmEmailChangeUseCase.execute({
      newEmail: dto.new_email,
      token: dto.token,
    })
  }
}
