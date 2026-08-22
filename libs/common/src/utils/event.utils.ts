import type { AttendeeDto } from '../dtos/attendee.dto';

import { AttendeeRole } from '../enums/attendee.enum';

export function canEditEvent(attendees: AttendeeDto[], userId: string): boolean {
  const attendee = attendees.find(a => a?.user?.id === userId);
  if (!attendee) return false;
  return [AttendeeRole.CREATOR, AttendeeRole.ADMIN].includes(attendee.role as AttendeeRole);
}
