import type { SecretSantaDto, SecretSantaUserDto } from '@wishlist/common';
import type { Event } from '../../event/domain/model/event.model';
import type { EventAttendee } from '../../event/domain/model/event-attendee.model';
import type { SecretSanta } from '../domain/model/secret-santa.model';
import type { SecretSantaUser } from '../domain/model/secret-santa-user.model';

import { eventMapper } from '../../event/infrastructure/event.mapper';
import { eventAttendeeMapper } from '../../event/infrastructure/event-attendee.mapper';

function toSecretSantaDto(model: SecretSanta, event: Event): SecretSantaDto {
  return {
    id: model.id,
    description: model.description,
    budget: model.budget,
    status: model.status,
    event: eventMapper.toMiniEventDto(event),
    users: model.users.map(user => toSecretSantaUserDto(user, event.attendees.find(a => a.id === user.attendeeId)!)),
    created_at: model.createdAt.toISOString(),
    updated_at: model.updatedAt.toISOString(),
  };
}

function toSecretSantaUserDto(model: SecretSantaUser, attendee: EventAttendee): SecretSantaUserDto {
  return {
    id: model.id,
    attendee: eventAttendeeMapper.toAttendeeDto(attendee),
    exclusions: model.exclusions,
  };
}

export const secretSantaMapper = {
  toSecretSantaDto,
  toSecretSantaUserDto,
};
