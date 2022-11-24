import { AttendeeDto } from '@wishlist/common-types';
import { AttendeeEntity } from './attendee.entity';
import { toMiniUserDto } from '../user/user.mapper';

export async function toAttendeeDto(entity: AttendeeEntity): Promise<AttendeeDto> {
  const user = entity.user ? await entity.user : null;

  return {
    id: entity.id,
    user: user && toMiniUserDto(user),
    pending_email: entity.email,
    role: entity.role,
  };
}
