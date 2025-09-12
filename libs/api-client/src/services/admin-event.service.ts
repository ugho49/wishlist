import type {
  DetailedEventDto,
  EventWithCountsDto,
  GetAllEventsPaginationQueryDto,
  PagedResponse,
  UpdateEventInputDto,
} from '@wishlist/common'
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

  async update(eventId: string, data: UpdateEventInputDto): Promise<void> {
    await this.client.put(`/admin/event/${eventId}`, data)
  }

  async delete(eventId: string): Promise<void> {
    await this.client.delete(`/admin/event/${eventId}`)
  }
}
