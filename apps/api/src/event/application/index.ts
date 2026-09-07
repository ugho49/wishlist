import { AddAttendeeUseCase } from './command/add-attendee.use-case';
import { CreateEventUseCase } from './command/create-event.use-case';
import { DeleteAttendeeUseCase } from './command/delete-attendee.use-case';
import { DeleteEventUseCase } from './command/delete-event.use-case';
import { JoinEventByInviteUseCase } from './command/join-event-by-invite.use-case';
import { UpdateAttendeeRoleUseCase } from './command/update-attendee-role.use-case';
import { UpdateEventUseCase } from './command/update-event.use-case';
import { AttendeeAddedHandler } from './event/attendee-added.handler';
import { GetEventAttendeesByIdsUseCase } from './query/get-event-attendees-by-ids.use-case';
import { GetEventInvitePreviewUseCase } from './query/get-event-invite-preview.use-case';
import { GetEventsUseCase } from './query/get-events.use-case';
import { GetEventsByIdsUseCase } from './query/get-events-by-ids.use-case';
import { GetEventsByUserUseCase } from './query/get-events-by-user.use-case';
import { GetEventsForUserUseCase } from './query/get-events-for-user.use-case';

export const handlers = [
  // Commands
  CreateEventUseCase,
  DeleteEventUseCase,
  UpdateEventUseCase,
  AddAttendeeUseCase,
  JoinEventByInviteUseCase,
  DeleteAttendeeUseCase,
  UpdateAttendeeRoleUseCase,
  // Queries
  GetEventsByIdsUseCase,
  GetEventsByUserUseCase,
  GetEventsForUserUseCase,
  GetEventInvitePreviewUseCase,
  GetEventsUseCase,
  GetEventAttendeesByIdsUseCase,
  // Event handlers
  AttendeeAddedHandler,
];
