import { Logger } from '@nestjs/common'
import { EventsHandler, IEventHandler } from '@nestjs/cqrs'

import { AttendeeAddedEvent } from '../../domain'
import { EventMailer } from '../../infrastructure'

@EventsHandler(AttendeeAddedEvent)
export class AttendeeAddedUseCase implements IEventHandler<AttendeeAddedEvent> {
  private readonly logger = new Logger(AttendeeAddedUseCase.name)

  constructor(private readonly eventMailer: EventMailer) {}

  async handle(event: AttendeeAddedEvent): Promise<void> {
    const params = {
      emails: event.newAttendee.getEmail(),
      event: event.event,
      invitedBy: event.invitedBy,
    }

    try {
      if (event.newAttendee.isLinkedToUser()) {
        await this.eventMailer.sendEmailForExistingAttendee(params)
      } else {
        await this.eventMailer.sendEmailForNotExistingAttendee(params)
      }
    } catch (e) {
      this.logger.error('Fail to send mail to new attendee', e)
    }
  }
}
