import { AttendeeDto } from '../dtos/index.js'
import { AttendeeRole } from '../enums/index.js'

export function canEditEvent(attendees: AttendeeDto[], userId: string): boolean {
  const attendee = attendees.find(a => a?.user?.id === userId)
  if (!attendee) return false
  return [AttendeeRole.MAINTAINER].includes(attendee.role as AttendeeRole)
}
