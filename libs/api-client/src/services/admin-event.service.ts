import type { DetailedEventDto, EventWithCountsDto, GetEventsQueryDto, PagedResponse } from '@wishlist/common-types'

import { AxiosInstance } from 'axios'

import { CommonRequestOptions } from './common'

export class AdminEventService {
  constructor(private readonly client: AxiosInstance) {}

  getById(eventId: string, options?: CommonRequestOptions): Promise<DetailedEventDto> {
    return this.client.get(`/admin/event/${eventId}`, { signal: options?.signal }).then(res => res.data)
  }

  getAll(params: GetEventsQueryDto, options?: CommonRequestOptions): Promise<PagedResponse<EventWithCountsDto>> {
    return this.client.get(`/admin/event`, { params, signal: options?.signal }).then(res => res.data)
  }
}
