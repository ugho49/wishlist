import type { AttendeeDto } from '../dtos'

import { AttendeeRole } from '../enums'

export function canEditEvent(attendees: AttendeeDto[], userId: string): boolean {
  const attendee = attendees.find(a => a?.user?.id === userId)
  if (!attendee) return false
  return [AttendeeRole.CREATOR, AttendeeRole.ADMIN].includes(attendee.role as AttendeeRole)
}
