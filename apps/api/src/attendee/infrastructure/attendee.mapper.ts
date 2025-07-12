import type { AttendeeDto } from '@wishlist/common'

import type { Attendee } from '../domain'

import { userMapper } from '@wishlist/api/user'

function toAttendeeDto(model: Attendee): AttendeeDto {
  return {
    id: model.id,
    user: model.user ? userMapper.toMiniUserDto(model.user) : undefined,
    pending_email: model.email || undefined,
    role: model.role,
  }
}

export const attendeeMapper = {
  toAttendeeDto,
}
