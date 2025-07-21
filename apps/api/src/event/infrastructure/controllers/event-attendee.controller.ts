import { Body, Controller, Delete, Param, Post } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '@wishlist/api/auth'
import { AddEventAttendeeInputDto, AttendeeDto, AttendeeId, EventId, ICurrentUser } from '@wishlist/common'

import { AddAttendeeCommand, DeleteAttendeeCommand } from '../../domain'

@ApiTags('Event Attendee')
@Controller('/event/:eventId/attendee')
export class EventAttendeeController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  addAttendee(
    @CurrentUser() currentUser: ICurrentUser,
    @Param('eventId') eventId: EventId,
    @Body() dto: AddEventAttendeeInputDto,
  ): Promise<AttendeeDto> {
    return this.commandBus.execute(
      new AddAttendeeCommand({
        currentUser,
        eventId,
        newAttendee: dto,
      }),
    )
  }

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
