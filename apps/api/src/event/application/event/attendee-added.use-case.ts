import { Logger } from '@nestjs/common'
import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { FrontendRoutesService, MailService, MailTemplate } from '@wishlist/api/core'

import { AttendeeAddedEvent, Event } from '../../domain'

@EventsHandler(AttendeeAddedEvent)
export class AttendeeAddedUseCase implements IEventHandler<AttendeeAddedEvent> {
  private readonly logger = new Logger(AttendeeAddedUseCase.name)

  constructor(
    private readonly mailService: MailService,
    private readonly frontendRoutes: FrontendRoutesService,
  ) {}

  async handle(event: AttendeeAddedEvent): Promise<void> {
    const params = {
      email: event.newAttendee.getEmail(),
      event: event.event,
      invitedBy: event.invitedBy,
    }

    try {
      if (event.newAttendee.isLinkedToUser()) {
        await this.sendEmailForExistingAttendee(params)
      } else {
        await this.sendEmailForNotExistingAttendee(params)
      }
    } catch (e) {
      this.logger.error('Fail to send mail to new attendee', e)
    }
  }

  private async sendEmailForExistingAttendee(params: {
    email: string
    event: Event
    invitedBy: { firstName: string; lastName: string }
  }): Promise<void> {
    await this.mailService.sendMail({
      to: params.email,
      subject: '[Wishlist] Vous participez à un nouvel événement',
      template: MailTemplate.ADDED_TO_EVENT,
      context: {
        eventTitle: params.event.title,
        eventUrl: this.frontendRoutes.routes.event.byId(params.event.id),
        invitedBy: `${params.invitedBy.firstName} ${params.invitedBy.lastName}`,
      },
    })
  }

  private async sendEmailForNotExistingAttendee(params: {
    email: string
    event: Event
    invitedBy: { firstName: string; lastName: string }
  }): Promise<void> {
    await this.mailService.sendMail({
      to: params.email,
      subject: '[Wishlist] Vous participez à un nouvel événement',
      template: MailTemplate.ADDED_TO_EVENT_NEW_USER,
      context: {
        eventTitle: params.event.title,
        registerUrl: this.frontendRoutes.routes.user.register(),
        invitedBy: `${params.invitedBy.firstName} ${params.invitedBy.lastName}`,
      },
    })
  }
}
