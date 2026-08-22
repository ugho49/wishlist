import type { EventAttendee } from './event.types'

import { AttendeeRole } from '../../gql'

const EDITABLE_ROLES: AttendeeRole[] = [AttendeeRole.Creator, AttendeeRole.Admin]

export function canEditEvent(attendees: EventAttendee[], userId: string | undefined): boolean {
  if (!userId) return false
  return attendees.some(attendee => attendee.user?.id === userId && EDITABLE_ROLES.includes(attendee.role))
}
