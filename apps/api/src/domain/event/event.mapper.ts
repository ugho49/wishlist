import { MiniEventDto } from '@wishlist/common-types';
import { EventEntity } from './entities/event.entity';

export function toMiniEventDto(entity: EventEntity): MiniEventDto {
  return {
    id: entity.id,
    title: entity.title,
    description: entity.description,
    event_date: entity.eventDate.toISOString(),
  };
}
