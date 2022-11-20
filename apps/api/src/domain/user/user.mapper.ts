import { UserDto } from '@wishlist/common-types';
import { UserEntity } from './user.entity';

export function toDto(entity: UserEntity): UserDto {
  return {
    id: entity.id,
    firstname: entity.firstName,
    lastname: entity.lastName,
    email: entity.email,
    created_at: entity.createdAt.toISOString(),
    updated_at: entity.updatedAt.toISOString(),
  };
}
