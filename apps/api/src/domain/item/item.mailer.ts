import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class ItemMailer {
  constructor(private readonly mailerService: MailerService) {}

  async sendNotifyEmail(param: {
    emails: string[];
    wishlist: { id: string; title: string };
    ownerName: string;
    nbNewItems: number;
  }) {
    await this.mailerService.sendMail({
      to: param.emails,
      subject: '[Wishlist] Des souhaits ont été ajoutés !!',
      template: 'new-items-reminder',
      context: {
        wishlistTitle: param.wishlist.title,
        wishlistUrl: `https://wishlistapp.fr/wishlists/${param.wishlist.id}`,
        nbItems: param.nbNewItems,
        userName: param.ownerName,
      },
    });
  }
}
