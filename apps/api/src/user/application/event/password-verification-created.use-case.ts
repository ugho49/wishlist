import { Inject } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { appConfig, MailService } from '@wishlist/api/core'

import { PasswordVerificationCreatedEvent } from '../../domain'

@EventsHandler(PasswordVerificationCreatedEvent)
export class PasswordVerificationCreatedUseCase implements IEventHandler<PasswordVerificationCreatedEvent> {
  constructor(
    private readonly mailService: MailService,
    @Inject(appConfig.KEY)
    private readonly config: ConfigType<typeof appConfig>,
  ) {}

  async handle(params: PasswordVerificationCreatedEvent) {
    await this.mailService.sendMail({
      to: params.email,
      subject: '[Wishlist] Reinitialiser le mot de passe',
      template: 'reset-password',
      context: {
        url: this.generateResetPasswordUrl({ email: params.email, token: params.token }),
      },
    })
  }

  private generateResetPasswordUrl(param: { email: string; token: string }) {
    const url = new URL(`${this.config.frontendBaseUrl}/reset-password`)
    url.searchParams.append('email', param.email)
    url.searchParams.append('token', param.token)
    return url.toString()
  }
}
