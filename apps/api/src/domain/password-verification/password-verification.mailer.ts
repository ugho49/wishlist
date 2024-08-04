import { Injectable } from '@nestjs/common'

import { MailService } from '../../core/mail/mail.service'

@Injectable()
export class PasswordVerificationMailer {
  constructor(private readonly mailService: MailService) {}

  async sendResetEmail(param: { email: string; url: string }) {
    await this.mailService.sendMail({
      to: param.email,
      subject: '[Wishlist] Reinitialiser le mot de passe',
      template: 'reset-password',
      context: {
        url: param.url,
      },
    })
  }
}
