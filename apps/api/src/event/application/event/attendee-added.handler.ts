import { OnEvent } from '@znight/events';
import { getLogger } from '@znight/observability';

import { FrontendRoutesService } from '../../../core/frontend-routes/frontend-routes.service';
import { MailService } from '../../../core/mail/mail.service';
import { MailTemplate } from '../../../core/mail/mail.type';
import { AttendeeAddedEvent } from '../../domain/event/attendee-added.event';
import { Event } from '../../domain/model/event.model';

export class AttendeeAddedHandler {
  private readonly logger = getLogger(AttendeeAddedHandler.name);

  constructor(
    private readonly mailService: MailService,
    private readonly frontendRoutes: FrontendRoutesService,
  ) {}

  @OnEvent({ detached: true })
  async handle(event: AttendeeAddedEvent): Promise<void> {
    this.logger.info('Attendee added event received', { event });

    const params = {
      email: event.newAttendee.getEmail(),
      event: event.event,
      invitedBy: event.invitedBy,
    };

    try {
      if (event.newAttendee.isLinkedToUser()) {
        await this.sendEmailForExistingAttendee(params);
      } else {
        await this.sendEmailForNotExistingAttendee(params);
      }
    } catch (e) {
      this.logger.error('Fail to send mail to new attendee', { error: e });
    }
  }

  private async sendEmailForExistingAttendee(params: {
    email: string;
    event: Event;
    invitedBy: { firstName: string; lastName: string };
  }): Promise<void> {
    await this.mailService.sendMail({
      to: params.email,
      subject: 'Vous participez à un nouvel événement',
      template: MailTemplate.ADDED_TO_EVENT,
      context: {
        eventTitle: params.event.title,
        eventUrl: this.frontendRoutes.routes.event.byId(params.event.id),
        invitedBy: `${params.invitedBy.firstName} ${params.invitedBy.lastName}`,
      },
    });
  }

  private async sendEmailForNotExistingAttendee(params: {
    email: string;
    event: Event;
    invitedBy: { firstName: string; lastName: string };
  }): Promise<void> {
    await this.mailService.sendMail({
      to: params.email,
      subject: 'Vous participez à un nouvel événement',
      template: MailTemplate.ADDED_TO_EVENT_NEW_USER,
      context: {
        eventTitle: params.event.title,
        registerUrl: this.frontendRoutes.routes.user.register(),
        invitedBy: `${params.invitedBy.firstName} ${params.invitedBy.lastName}`,
      },
    });
  }
}
