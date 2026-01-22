import { Controller, Delete, Param } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CurrentUser, IsAdmin } from '@wishlist/api/auth'
import { AttendeeId, EventId, ICurrentUser } from '@wishlist/common'

import { DeleteAttendeeUseCase } from '../../application/command/delete-attendee.use-case'

@IsAdmin()
@ApiTags('ADMIN - Event Attendee')
@Controller('/admin/event/:eventId/attendee')
export class EventAttendeeAdminController {
  constructor(private readonly deleteAttendeeUseCase: DeleteAttendeeUseCase) {}

  @Delete('/:attendeeId')
  async deleteAttendee(
    @CurrentUser() currentUser: ICurrentUser,
    @Param('eventId') eventId: EventId,
    @Param('attendeeId') attendeeId: AttendeeId,
  ): Promise<void> {
    await this.deleteAttendeeUseCase.execute({
      currentUser,
      attendeeId,
      eventId,
    })
  }
}
