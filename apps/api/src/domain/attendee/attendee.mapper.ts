import { AttendeeDto } from '@wishlist/common-types';
import { AttendeeEntity } from './attendee.entity';
import { toMiniUserDto } from '../user/user.mapper';

export async function toAttendeeDto(entity: AttendeeEntity): Promise<AttendeeDto> {
  const user = await entity.user;

  return {
    id: entity.id,
    user: user ? toMiniUserDto(user) : undefined,
    pending_email: entity.email || undefined,
    role: entity.role,
  };
}
