import type { MiniEventDto } from '@wishlist/common'

import type { Event } from '../domain'

import { DateTime } from 'luxon'

export function toMiniEventDto(model: Event): MiniEventDto {
  return {
    id: model.id,
    title: model.title,
    description: model.description || undefined,
    event_date: DateTime.fromJSDate(model.eventDate).toISODate() || '',
  }
}

export const eventMapper = {
  toMiniEventDto,
}
