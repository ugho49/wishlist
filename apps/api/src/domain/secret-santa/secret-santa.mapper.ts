import { SecretSantaDto, SecretSantaUserDto } from '@wishlist/common-types';
import { SecretSantaEntity, SecretSantaUserEntity } from './secret-santa.entity';
import { toMiniEventDto } from '../event/event.mapper';
import { toAttendeeDto } from '../attendee/attendee.mapper';

export async function toSecretSantaDto(entity: SecretSantaEntity): Promise<SecretSantaDto> {
  const [event, users] = await Promise.all([entity.event, entity.users]);
  const usersDto = await Promise.all(users.map((user) => toSecretSantaUserDto(user)));

  return {
    id: entity.id,
    description: entity.description ?? undefined,
    budget: entity.budget ?? undefined,
    status: entity.status,
    event: toMiniEventDto(event),
    users: usersDto,
    created_at: entity.createdAt.toISOString(),
    updated_at: entity.updatedAt.toISOString(),
  };
}

export async function toSecretSantaUserDto(entity: SecretSantaUserEntity): Promise<SecretSantaUserDto> {
  const attendee = await entity.attendee.then(toAttendeeDto);
  return {
    id: entity.id,
    attendee,
    exclusions: entity.exclusions,
  };
}
