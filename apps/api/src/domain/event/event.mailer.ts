import { Injectable } from '@nestjs/common'
import { EventId } from '@wishlist/common-types'

import { MailService } from '../../core/mail/mail.service'

@Injectable()
export class EventMailer {
  constructor(private readonly mailService: MailService) {}

  async sendEmailForExistingAttendee(params: {
    emails: string[] | string
    event: { id: EventId; title: string }
    invitedBy: { firstName: string; lastName: string }
  }): Promise<void> {
    if (params.emails.length === 0) {
      return
    }

    await this.mailService.sendMail({
      to: params.emails,
      subject: '[Wishlist] Vous participez à un nouvel événement',
      template: 'added-to-event',
      context: {
        eventTitle: params.event.title,
        eventUrl: `https://wishlistapp.fr/events/${params.event.id}`,
        invitedBy: params.invitedBy.firstName + ' ' + params.invitedBy.lastName,
      },
    })
  }

  async sendEmailForNotExistingAttendee(params: {
    emails: string[] | string
    event: { id: EventId; title: string }
    invitedBy: { firstName: string; lastName: string }
  }): Promise<void> {
    if (params.emails.length === 0) {
      return
    }

    await this.mailService.sendMail({
      to: params.emails,
      subject: '[Wishlist] Vous participez à un nouvel événement',
      template: 'added-to-event-new-user',
      context: {
        eventTitle: params.event.title,
        registerUrl: 'https://wishlistapp.fr/register',
        invitedBy: params.invitedBy.firstName + ' ' + params.invitedBy.lastName,
      },
    })
  }
}
