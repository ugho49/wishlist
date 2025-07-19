import { CreateEventUseCase, DeleteEventUseCase, UpdateEventUseCase } from './command'
import { GetEventByIdUseCase, GetEventsForUserUseCase, GetEventsUseCase } from './query'

export const handlers = [
  // Command handlers
  CreateEventUseCase,
  DeleteEventUseCase,
  UpdateEventUseCase,
  // Query handlers
  GetEventByIdUseCase,
  GetEventsForUserUseCase,
  GetEventsUseCase,
]
