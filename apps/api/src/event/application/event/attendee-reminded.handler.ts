import { OnEvent } from '@znight/events';
import { getLogger } from '@znight/observability';
import { DateTime } from 'luxon';

import { FrontendRoutesService } from '../../../core/frontend-routes/frontend-routes.service';
import { MailService } from '../../../core/mail/mail.service';
import { MailTemplate } from '../../../core/mail/mail.type';
import { AttendeeRemindedEvent } from '../../domain/event/attendee-reminded.event';

export class AttendeeRemindedHandler {
  private readonly logger = getLogger(AttendeeRemindedHandler.name);

  constructor(
    private readonly mailService: MailService,
    private readonly frontendRoutes: FrontendRoutesService,
  ) {}

  @OnEvent({ detached: true })
  async handle(event: AttendeeRemindedEvent): Promise<void> {
    const { attendee, remindedBy } = event;
    this.logger.info('Attendee reminded event received', { eventId: event.event.id, attendeeId: attendee.id });

    const hasAccount = attendee.isLinkedToUser();
    const daysLeft = Math.max(
      0,
      Math.round(
        DateTime.fromJSDate(event.event.eventDate).startOf('day').diff(DateTime.now().startOf('day'), 'days').days,
      ),
    );

    try {
      await this.mailService.sendMail({
        to: attendee.getEmail(),
        subject: `N'oubliez pas votre liste pour ${event.event.title}`,
        template: MailTemplate.WISHLIST_REMINDER,
        // A retried job must not send the same reminder twice.
        idempotencyKey: `wishlist-reminder/${attendee.id}/${attendee.lastRemindedAt?.toISOString()}`,
        context: {
          eventTitle: event.event.title,
          remindedBy: `${remindedBy.firstName} ${remindedBy.lastName}`,
          daysLeft,
          url: hasAccount
            ? this.frontendRoutes.routes.event.byId(event.event.id)
            : this.frontendRoutes.routes.user.register(),
          hasAccount,
        },
      });
    } catch (e) {
      this.logger.error('Fail to send wishlist reminder mail', { error: e });
    }
  }
}
