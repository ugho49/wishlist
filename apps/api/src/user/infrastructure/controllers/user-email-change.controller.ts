import { Body, Controller, Post } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiTags } from '@nestjs/swagger'
import { CurrentUser, Public } from '@wishlist/api/auth'
import { ConfirmEmailChangeInputDto, type ICurrentUser, RequestEmailChangeInputDto } from '@wishlist/common'

import { ConfirmEmailChangeCommand, CreateEmailChangeVerificationCommand } from '../../domain'

@ApiTags('User Email Change')
@Controller('/user/email-change')
export class UserEmailChangeController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('/request')
  async requestEmailChange(
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: RequestEmailChangeInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new CreateEmailChangeVerificationCommand({
        currentUser,
        newEmail: dto.new_email,
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
