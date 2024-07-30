import { Injectable } from '@nestjs/common'

import { MailService } from '../../core/mail/mail.service'

@Injectable()
export class UserMailer {
  constructor(private readonly mailService: MailService) {}

  async sendWelcomeMail(params: { email: string; firstName: string }): Promise<void> {
    await this.mailService.sendMail({
      to: params.email,
      subject: '[Wishlist] Bienvenue !!!',
      template: 'welcome-user',
      context: {
        username: params.firstName,
      },
    })
  }
}
