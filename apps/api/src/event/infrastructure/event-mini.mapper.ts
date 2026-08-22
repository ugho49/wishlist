import type { MiniEventDto } from '@wishlist/common';
import type { Event } from '../domain/model/event.model';

import { DateTime } from 'luxon';

export function toMiniEventDto(event: Event): MiniEventDto {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    icon: event.icon,
    event_date: DateTime.fromJSDate(event.eventDate).toISODate() || '',
  };
}
