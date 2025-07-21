import { Logger } from '@nestjs/common'
import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { MailService } from '@wishlist/api/core'

import { UserCreatedEvent } from '../../domain'

@EventsHandler(UserCreatedEvent)
export class UserCreatedUseCase implements IEventHandler<UserCreatedEvent> {
  private readonly logger = new Logger(UserCreatedUseCase.name)

  constructor(private readonly mailService: MailService) {}

  async handle(params: UserCreatedEvent) {
    try {
      await this.mailService.sendMail({
        to: params.user.email,
        subject: '[Wishlist] Bienvenue !!!',
        template: 'welcome-user',
        context: {
          mainUrl: 'https://wishlistapp.fr/',
        },
      })
    } catch (error) {
      this.logger.error('Fail to send welcome mail to user', error)
    }
  }
}
