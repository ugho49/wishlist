import { AddAttendeeUseCase } from './command/add-attendee.use-case'
import { CreateEventUseCase } from './command/create-event.use-case'
import { DeleteAttendeeUseCase } from './command/delete-attendee.use-case'
import { DeleteEventUseCase } from './command/delete-event.use-case'
import { UpdateEventUseCase } from './command/update-event.use-case'
import { AttendeeAddedUseCase } from './event/attendee-added.use-case'
import { GetEventByIdUseCase } from './query/get-event-by-id.use-case'
import { GetEventsUseCase } from './query/get-events.use-case'
import { GetEventsForUserUseCase } from './query/get-events-for-user.use-case'

export const handlers = [
  // Command handlers
  CreateEventUseCase,
  DeleteEventUseCase,
  UpdateEventUseCase,
  AddAttendeeUseCase,
  DeleteAttendeeUseCase,
  // Query handlers
  GetEventByIdUseCase,
  GetEventsForUserUseCase,
  GetEventsUseCase,
  // Event handlers
  AttendeeAddedUseCase,
]
