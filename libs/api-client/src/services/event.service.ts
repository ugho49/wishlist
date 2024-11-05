import type {
  CreateEventInputDto,
  DetailedEventDto,
  EventWithCountsDto,
  GetEventsQueryDto,
  MiniEventDto,
  PagedResponse,
  UpdateEventInputDto,
} from '@wishlist/common-types'
import type { AxiosInstance } from 'axios'

import type { CommonRequestOptions } from './common'

export class EventService {
  constructor(private readonly client: AxiosInstance) {}

  getById(eventId: string, options?: CommonRequestOptions): Promise<DetailedEventDto> {
    return this.client.get(`/event/${eventId}`, { signal: options?.signal }).then(res => res.data)
  }

  getAll(params: GetEventsQueryDto, options?: CommonRequestOptions): Promise<PagedResponse<EventWithCountsDto>> {
    return this.client.get(`/event`, { params, signal: options?.signal }).then(res => res.data)
  }

  create(data: CreateEventInputDto): Promise<MiniEventDto> {
    return this.client.post('/event', data).then(res => res.data)
  }

  async update(eventId: string, data: UpdateEventInputDto): Promise<void> {
    await this.client.put(`/event/${eventId}`, data)
  }

  async delete(eventId: string): Promise<void> {
    await this.client.delete(`/event/${eventId}`)
  }
}
