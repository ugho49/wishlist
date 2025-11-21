import { Body, Controller, Get, Post } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { ApiTags } from '@nestjs/swagger'
import { CurrentUser, Public } from '@wishlist/api/auth'
import {
  ConfirmEmailChangeInputDto,
  type ICurrentUser,
  type PendingEmailChangeDto,
  RequestEmailChangeInputDto,
} from '@wishlist/common'

import {
  ConfirmEmailChangeCommand,
  CreateEmailChangeVerificationCommand,
  GetPendingEmailChangeQuery,
} from '../../domain'

@ApiTags('User Email Change')
@Controller('/user/email-change')
export class UserEmailChangeController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('/pending')
  async getPendingEmailChange(@CurrentUser() currentUser: ICurrentUser): Promise<PendingEmailChangeDto | undefined> {
    const result = await this.queryBus.execute(new GetPendingEmailChangeQuery({ currentUser }))

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
    await this.commandBus.execute(
      new CreateEmailChangeVerificationCommand({
        currentUser,
        newEmail: dto.new_email,
        password: dto.password,
      }),
    )
  }

  @Public()
  @Post('/confirm')
  async confirmEmailChange(@Body() dto: ConfirmEmailChangeInputDto): Promise<void> {
    await this.commandBus.execute(
      new ConfirmEmailChangeCommand({
        newEmail: dto.new_email,
        token: dto.token,
      }),
    )
  }
}
