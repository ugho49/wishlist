import { EventWithCountsDto, MiniEventDto } from '@wishlist/common-types';
import { EventEntity } from './entities/event.entity';

export function toMiniEventDto(entity: EventEntity): MiniEventDto {
  return {
    id: entity.id,
    title: entity.title,
    description: entity.description,
    event_date: entity.eventDate.toISOString(),
  };
}

export async function toEventWithCountsDtoDto(entity: EventEntity): Promise<EventWithCountsDto> {
  const [wishlists, attendees] = await Promise.all([entity.wishlists, entity.attendees]);
  return {
    id: entity.id,
    title: entity.title,
    description: entity.description,
    event_date: entity.eventDate.toISOString(),
    nb_wishlists: wishlists.length,
    nb_attendees: attendees.length,
    created_at: entity.createdAt.toISOString(),
    updated_at: entity.updatedAt.toISOString(),
  };
}
