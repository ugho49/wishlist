import { Controller, Delete, Param } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiTags } from '@nestjs/swagger'
import { CurrentUser, IsAdmin } from '@wishlist/api/auth'
import { AttendeeId, EventId, ICurrentUser } from '@wishlist/common'

import { DeleteAttendeeCommand } from '../../domain'

@IsAdmin()
@ApiTags('ADMIN - Event Attendee')
@Controller('/admin/event/:eventId/attendee')
export class EventAttendeeAdminController {
  constructor(private readonly commandBus: CommandBus) {}

  @Delete('/:attendeeId')
  async deleteAttendee(
    @CurrentUser() currentUser: ICurrentUser,
    @Param('eventId') eventId: EventId,
    @Param('attendeeId') attendeeId: AttendeeId,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteAttendeeCommand({
        currentUser,
        attendeeId,
        eventId,
      }),
    )
  }
}
