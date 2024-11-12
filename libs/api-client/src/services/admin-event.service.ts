import type {
  DetailedEventDto,
  EventWithCountsDto,
  GetAllEventsPaginationQueryDto,
  PagedResponse,
} from '@wishlist/common-types'
import type { AxiosInstance } from 'axios'

import type { CommonRequestOptions } from './common'

export class AdminEventService {
  constructor(private readonly client: AxiosInstance) {}

  getById(eventId: string, options?: CommonRequestOptions): Promise<DetailedEventDto> {
    return this.client.get(`/admin/event/${eventId}`, { signal: options?.signal }).then(res => res.data)
  }

  getAll(
    params: GetAllEventsPaginationQueryDto,
    options?: CommonRequestOptions,
  ): Promise<PagedResponse<EventWithCountsDto>> {
    return this.client.get(`/admin/event`, { params, signal: options?.signal }).then(res => res.data)
  }
}
