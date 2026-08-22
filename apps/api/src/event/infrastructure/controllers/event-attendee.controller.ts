import { Body, Controller, Delete, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  AddEventAttendeeInputDto,
  AttendeeDto,
  type AttendeeId,
  type EventId,
  type ICurrentUser,
  UpdateEventAttendeeRoleInputDto,
} from '@wishlist/common';

import { CurrentUser } from '../../../auth/infrastructure/decorators/user.decorator';
import { AddAttendeeUseCase } from '../../application/command/add-attendee.use-case';
import { DeleteAttendeeUseCase } from '../../application/command/delete-attendee.use-case';
import { UpdateAttendeeRoleUseCase } from '../../application/command/update-attendee-role.use-case';

@ApiTags('Event Attendee')
@Controller('/event/:eventId/attendee')
export class EventAttendeeController {
  constructor(
    private readonly addAttendeeUseCase: AddAttendeeUseCase,
    private readonly deleteAttendeeUseCase: DeleteAttendeeUseCase,
    private readonly updateAttendeeRoleUseCase: UpdateAttendeeRoleUseCase,
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
    });
  }

  @Put('/:attendeeId')
  async updateAttendeeRole(
    @CurrentUser() currentUser: ICurrentUser,
    @Param('eventId') eventId: EventId,
    @Param('attendeeId') attendeeId: AttendeeId,
    @Body() dto: UpdateEventAttendeeRoleInputDto,
  ): Promise<void> {
    await this.updateAttendeeRoleUseCase.execute({
      currentUser,
      eventId,
      attendeeId,
      role: dto.role,
    });
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
    });
  }
}
