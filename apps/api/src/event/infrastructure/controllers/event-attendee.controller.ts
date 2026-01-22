import { Body, Controller, Delete, Param, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '@wishlist/api/auth'
import { AddEventAttendeeInputDto, AttendeeDto, AttendeeId, EventId, ICurrentUser } from '@wishlist/common'

import { AddAttendeeUseCase } from '../../application/command/add-attendee.use-case'
import { DeleteAttendeeUseCase } from '../../application/command/delete-attendee.use-case'

@ApiTags('Event Attendee')
@Controller('/event/:eventId/attendee')
export class EventAttendeeController {
  constructor(
    private readonly addAttendeeUseCase: AddAttendeeUseCase,
    private readonly deleteAttendeeUseCase: DeleteAttendeeUseCase,
  ) {}

  @Post()
  addAttendee(
    @CurrentUser() currentUser: ICurrentUser,
    @Param('eventId') eventId: EventId,
    @Body() dto: AddEventAttendeeInputDto,
  ): Promise<AttendeeDto> {
    return this.addAttendeeUseCase.execute({
      currentUser,
      eventId,
      newAttendee: {
        email: dto.email,
        role: dto.role,
      },
    })
  }

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
