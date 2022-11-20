import { UserDto } from '@wishlist/common-types';
import { UserEntity } from './user.entity';
import { DateTime } from 'luxon';

export function toDto(entity: UserEntity): UserDto {
  return {
    id: entity.id,
    firstname: entity.firstName,
    lastname: entity.lastName,
    email: entity.email,
    admin: entity.isAdmin(),
    birthday: entity.birthday && DateTime.fromJSDate(entity.birthday).toLocaleString(DateTime.DATETIME_SHORT),
    is_enabled: entity.isEnabled,
    last_connected_at: entity.lastConnectedAt?.toISOString(),
    last_ip: entity.lastIp,
    created_at: entity.createdAt.toISOString(),
    updated_at: entity.updatedAt.toISOString(),
  };
}
