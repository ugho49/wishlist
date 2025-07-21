import { AddAttendeeUseCase, DeleteAttendeeUseCase, OldDeleteAttendeeUseCase } from './command'
import { AttendeeAddedUseCase } from './event'

export const handlers = [AddAttendeeUseCase, DeleteAttendeeUseCase, OldDeleteAttendeeUseCase, AttendeeAddedUseCase]
