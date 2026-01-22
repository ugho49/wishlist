import { AddAttendeeUseCase } from './command/add-attendee.use-case'
import { CreateEventUseCase } from './command/create-event.use-case'
import { DeleteAttendeeUseCase } from './command/delete-attendee.use-case'
import { DeleteEventUseCase } from './command/delete-event.use-case'
import { UpdateEventUseCase } from './command/update-event.use-case'
import { AttendeeAddedHandler } from './event/attendee-added.handler'
import { GetEventAttendeesByIdsUseCase } from './query/get-event-attendees-by-ids.use-case'
import { GetEventByIdUseCase } from './query/get-event-by-id.use-case'
import { GetEventsUseCase } from './query/get-events.use-case'
import { GetEventsByIdsUseCase } from './query/get-events-by-ids.use-case'
import { GetEventsByUserUseCase } from './query/get-events-by-user.use-case'
import { GetEventsForUserUseCase } from './query/get-events-for-user.use-case'

export const handlers = [
  // Commands
  CreateEventUseCase,
  DeleteEventUseCase,
  UpdateEventUseCase,
  AddAttendeeUseCase,
  DeleteAttendeeUseCase,
  // Queries
  GetEventByIdUseCase,
  GetEventsByIdsUseCase,
  GetEventsByUserUseCase,
  GetEventsForUserUseCase,
  GetEventsUseCase,
  GetEventAttendeesByIdsUseCase,
  // Event handlers
  AttendeeAddedHandler,
]
