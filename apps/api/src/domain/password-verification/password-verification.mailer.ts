import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'

@Injectable()
export class PasswordVerificationMailer {
  constructor(private readonly mailerService: MailerService) {}

  async sendResetEmail(param: { email: string; url: string }) {
    await this.mailerService.sendMail({
      to: param.email,
      subject: '[Wishlist] Reinitialiser le mot de passe',
      template: 'reset-password',
      context: {
        url: param.url,
      },
    })
  }
}
