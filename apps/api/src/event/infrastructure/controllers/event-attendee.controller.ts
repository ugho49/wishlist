import { Body, Controller, Delete, Param, Post } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '@wishlist/api/auth'
import {
  AddEventAttendeeForEventInputDto,
  AddEventAttendeeInputDto,
  AttendeeDto,
  AttendeeId,
  EventId,
  ICurrentUser,
} from '@wishlist/common'

import { AddAttendeeCommand, DeleteAttendeeCommand, OldDeleteAttendeeCommand } from '../../domain'

@ApiTags('Event Attendee')
@Controller() // TODO: put base path in the module once old route have been removed
export class EventAttendeeController {
  constructor(private readonly commandBus: CommandBus) {}

  /**
   * @deprecated
   */
  @Post('/attendee')
  oldAddAttendeeRoute(
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: AddEventAttendeeForEventInputDto,
  ): Promise<AttendeeDto> {
    return this.commandBus.execute(
      new AddAttendeeCommand({
        currentUser,
        eventId: dto.event_id,
        newAttendee: {
          email: dto.email,
          role: dto.role,
        },
      }),
    )
  }

  @Post('/event/:eventId/attendee')
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

  /**
   * @deprecated
   */
  @Delete('/attendee/:id')
  async oldDeleteAttendeeRoute(
    @Param('id') attendeeId: AttendeeId,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<void> {
    await this.commandBus.execute(
      new OldDeleteAttendeeCommand({
        currentUser,
        attendeeId,
      }),
    )
  }

  @Delete('/event/:eventId/attendee/:attendeeId')
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
