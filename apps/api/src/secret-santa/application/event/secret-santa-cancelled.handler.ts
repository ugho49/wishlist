import { OnEvent } from '@znight/events';
import { getLogger } from '@znight/observability';

import { FrontendRoutesService } from '../../../core/frontend-routes/frontend-routes.service';
import { MailService } from '../../../core/mail/mail.service';
import { MailTemplate } from '../../../core/mail/mail.type';
import { SecretSantaCancelledEvent } from '../../domain/event/secret-santa-cancelled.event';

export class SecretSantaCancelledHandler {
  private readonly logger = getLogger(SecretSantaCancelledHandler.name);

  constructor(
    private readonly mailService: MailService,
    private readonly frontendRoutes: FrontendRoutesService,
  ) {}

  @OnEvent({ detached: true })
  async handle(params: SecretSantaCancelledEvent) {
    this.logger.info('Secret santa cancelled event received', { params });
    const { eventTitle, eventId, attendeeEmails } = params;

    this.logger.info('Sending email to attendees', { eventTitle, eventId, attendeeEmails });
    await this.mailService.sendMail({
      to: attendeeEmails,
      subject: "Le secret santa viens d'être annulé",
      template: MailTemplate.SECRET_SANTA_CANCEL,
      context: {
        eventTitle,
        eventUrl: this.frontendRoutes.routes.event.byId(eventId),
      },
    });
  }
}
