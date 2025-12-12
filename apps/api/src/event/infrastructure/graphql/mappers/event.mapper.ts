import type { AttendeeDto, DetailedEventDto, EventWithCountsDto, MiniEventDto, PagedResponse } from '@wishlist/common'
import type {
  AttendeeObject,
  DetailedEventObject,
  EventsPageObject,
  EventWithCountsObject,
  MiniEventObject,
} from '../types'

import { userGraphQLMapper } from '../../../../user/infrastructure/graphql'

export const eventGraphQLMapper = {
  toAttendeeObject(dto: AttendeeDto): AttendeeObject {
    return {
      id: dto.id,
      user: dto.user ? userGraphQLMapper.toMiniUserObject(dto.user) : undefined,
      pendingEmail: dto.pending_email,
      role: dto.role,
    }
  },

  toMiniEventObject(dto: MiniEventDto): MiniEventObject {
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      icon: dto.icon,
      eventDate: dto.event_date,
    }
  },

  toEventWithCountsObject(dto: EventWithCountsDto): EventWithCountsObject {
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      icon: dto.icon,
      eventDate: dto.event_date,
      nbWishlists: dto.nb_wishlists,
      attendees: dto.attendees.map(a => eventGraphQLMapper.toAttendeeObject(a)),
      createdAt: dto.created_at,
      updatedAt: dto.updated_at,
    }
  },

  toDetailedEventObject(dto: DetailedEventDto): DetailedEventObject {
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      icon: dto.icon,
      eventDate: dto.event_date,
      attendees: dto.attendees.map(a => eventGraphQLMapper.toAttendeeObject(a)),
      createdAt: dto.created_at,
      updatedAt: dto.updated_at,
    }
  },

  toEventsPageObject(page: PagedResponse<EventWithCountsDto>): EventsPageObject {
    const { pagination } = page
    const isLastPage = pagination.page_number >= pagination.total_pages
    return {
      resources: page.resources.map(e => eventGraphQLMapper.toEventWithCountsObject(e)),
      totalElements: pagination.total_elements,
      totalPages: pagination.total_pages,
      currentPage: pagination.page_number,
      pageSize: pagination.pages_size,
      isLastPage,
    }
  },
}
