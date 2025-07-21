import {
  AddAttendeeUseCase,
  CreateEventUseCase,
  DeleteAttendeeUseCase,
  DeleteEventUseCase,
  OldDeleteAttendeeUseCase,
  UpdateEventUseCase,
} from './command'
import { AttendeeAddedUseCase } from './event'
import { GetEventByIdUseCase, GetEventsForUserUseCase, GetEventsUseCase } from './query'

export const handlers = [
  // Command handlers
  CreateEventUseCase,
  DeleteEventUseCase,
  UpdateEventUseCase,
  AddAttendeeUseCase,
  DeleteAttendeeUseCase,
  OldDeleteAttendeeUseCase,
  // Query handlers
  GetEventByIdUseCase,
  GetEventsForUserUseCase,
  GetEventsUseCase,
  // Event handlers
  AttendeeAddedUseCase,
]
