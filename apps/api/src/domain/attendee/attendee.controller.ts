import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AttendeeService } from './attendee.service';
import { CurrentUser } from '../auth';
import { AddEventAttendeeForEventInputDto, AttendeeDto, ICurrentUser } from '@wishlist/common-types';

@ApiTags('Attendee')
@Controller('/attendee')
export class AttendeeController {
  constructor(private readonly attendeeService: AttendeeService) {}

  @Post()
  addAttendee(
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: AddEventAttendeeForEventInputDto
  ): Promise<AttendeeDto> {
    return this.attendeeService.addAttendee({ currentUser, dto });
  }

  @Delete('/:id')
  deleteAttendee(@Param('id') attendeeId: string, @CurrentUser() currentUser: ICurrentUser): Promise<void> {
    return this.attendeeService.deleteAttendee({ attendeeId, currentUser });
  }
}
