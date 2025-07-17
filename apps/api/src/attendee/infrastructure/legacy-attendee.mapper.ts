import type { AttendeeDto } from '@wishlist/common'

import type { AttendeeEntity } from './legacy-attendee.entity'

import { toMiniUserDto } from '@wishlist/api/user'

export async function toAttendeeDto(entity: AttendeeEntity): Promise<AttendeeDto> {
  const user = await entity.user

  return {
    id: entity.id,
    user: user ? toMiniUserDto(user) : undefined,
    pending_email: entity.email || undefined,
    role: entity.role,
  }
}
