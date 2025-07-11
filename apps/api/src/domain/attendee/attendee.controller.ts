import { Body, Controller, Delete, Param, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AddEventAttendeeForEventInputDto, AttendeeDto, AttendeeId, ICurrentUser } from '@wishlist/common'

import { CurrentUser } from '../auth'
import { AttendeeService } from './attendee.service'

@ApiTags('Attendee')
@Controller('/attendee')
export class AttendeeController {
  constructor(private readonly attendeeService: AttendeeService) {}

  @Post()
  addAttendee(
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: AddEventAttendeeForEventInputDto,
  ): Promise<AttendeeDto> {
    return this.attendeeService.addAttendee({ currentUser, dto })
  }

  @Delete('/:id')
  deleteAttendee(@Param('id') attendeeId: AttendeeId, @CurrentUser() currentUser: ICurrentUser): Promise<void> {
    return this.attendeeService.deleteAttendee({ attendeeId, currentUser })
  }
}
