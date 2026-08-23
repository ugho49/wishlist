import type { AttendeeRole } from '../enums/attendee.enum';
import type { AttendeeId } from '../ids';
import type { MiniUserDto } from './user.dto';

export class AttendeeDto {
  declare id: AttendeeId;
  declare user?: MiniUserDto;
  declare pending_email?: string;
  declare role: AttendeeRole;
}
