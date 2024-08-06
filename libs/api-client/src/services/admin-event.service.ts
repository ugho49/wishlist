import type { DetailedEventDto, EventWithCountsDto, GetEventsQueryDto, PagedResponse } from '@wishlist/common-types'

import { AxiosInstance } from 'axios'

export class AdminEventService {
  constructor(private readonly client: AxiosInstance) {}

  getById(eventId: string): Promise<DetailedEventDto> {
    return this.client.get(`/admin/event/${eventId}`).then(res => res.data)
  }

  getAll(params: GetEventsQueryDto): Promise<PagedResponse<EventWithCountsDto>> {
    return this.client.get(`/admin/event`, { params }).then(res => res.data)
  }
}
