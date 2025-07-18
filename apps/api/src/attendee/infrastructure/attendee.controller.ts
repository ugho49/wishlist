import { Body, Controller, Delete, Param, Post } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '@wishlist/api/auth'
import { AddEventAttendeeForEventInputDto, AttendeeDto, AttendeeId, ICurrentUser } from '@wishlist/common'

import { AddAttendeeCommand, DeleteAttendeeCommand } from '../domain'

@ApiTags('Attendee')
@Controller('/attendee')
export class AttendeeController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  addAttendee(
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

  @Delete('/:id')
  async deleteAttendee(@Param('id') attendeeId: AttendeeId, @CurrentUser() currentUser: ICurrentUser): Promise<void> {
    await this.commandBus.execute(
      new DeleteAttendeeCommand({
        currentUser,
        attendeeId,
      }),
    )
  }
}
