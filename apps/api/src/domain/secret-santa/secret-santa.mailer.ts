import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class SecretSantaMailer {
  constructor(private readonly mailerService: MailerService) {}
  //
  // async sendEmailForExistingAttendee(params: {
  //   emails: string[] | string;
  //   event: { id: string; title: string };
  //   creator: { firstName: string; lastName: string };
  // }): Promise<void> {
  //   if (params.emails.length === 0) {
  //     return;
  //   }
  //
  //   await this.mailerService.sendMail({
  //     to: params.emails,
  //     subject: '[Wishlist] Vous participez à un nouvel événement',
  //     template: 'added-to-event',
  //     context: {
  //       eventTitle: params.event.title,
  //       eventUrl: `https://wishlistapp.fr/events/${params.event.id}`,
  //       createdBy: params.creator.firstName + ' ' + params.creator.lastName,
  //     },
  //   });
  // }
  //
  // async sendEmailForNotExistingAttendee(params: {
  //   emails: string[] | string;
  //   event: { id: string; title: string };
  //   creator: { firstName: string; lastName: string };
  // }): Promise<void> {
  //   if (params.emails.length === 0) {
  //     return;
  //   }
  //
  //   await this.mailerService.sendMail({
  //     to: params.emails,
  //     subject: '[Wishlist] Vous participez à un nouvel événement',
  //     template: 'added-to-event-new-user',
  //     context: {
  //       eventTitle: params.event.title,
  //       registerUrl: 'https://wishlistapp.fr/register',
  //       createdBy: params.creator.firstName + ' ' + params.creator.lastName,
  //     },
  //   });
  // }
}
