import { AddAttendeeUseCase, DeleteAttendeeUseCase } from './command'
import { AttendeeAddedUseCase } from './event'

export const handlers = [AddAttendeeUseCase, DeleteAttendeeUseCase, AttendeeAddedUseCase]
