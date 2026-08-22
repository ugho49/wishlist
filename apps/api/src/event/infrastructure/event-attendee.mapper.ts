import type { AttendeeDto } from '@wishlist/common';
import type { EventAttendee } from '../domain/model/event-attendee.model';

import { userMapper } from '../../user/infrastructure/user.mapper';

function toAttendeeDto(model: EventAttendee): AttendeeDto {
  return {
    id: model.id,
    user: model.user ? userMapper.toMiniUserDto(model.user) : undefined,
    pending_email: model.pendingEmail,
    role: model.role,
  };
}

export const eventAttendeeMapper = {
  toAttendeeDto,
};
