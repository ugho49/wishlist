import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UserMailer {
  constructor(private readonly mailerService: MailerService) {}

  async sendWelcomeMail(params: { email: string; firstName: string }): Promise<void> {
    await this.mailerService.sendMail({
      to: params.email,
      subject: '[Wishlist] Bienvenue !!!',
      template: 'welcome-user',
      context: {
        username: params.firstName,
      },
    });
  }
}
