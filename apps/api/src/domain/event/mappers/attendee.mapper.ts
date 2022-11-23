import { AttendeeDto } from '@wishlist/common-types';
import { AttendeeEntity } from '../entities/attendee.entity';
import { toMiniUserDto } from '../../user/user.mapper';

export async function toAttendeeDto(entity: AttendeeEntity): Promise<AttendeeDto> {
  const user = entity.user ? await entity.user : null;

  return {
    user: user && toMiniUserDto(user),
    pending_email: entity.email,
    role: entity.role,
  };
}
