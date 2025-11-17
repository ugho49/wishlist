import type {
  CreateEventInputDto,
  DetailedEventDto,
  EventId,
  EventWithCountsDto,
  GetEventsQueryDto,
  MiniEventDto,
  PagedResponse,
  UpdateEventInputDto,
} from '@wishlist/common'
import type { AxiosInstance } from 'axios'
import type { CommonRequestOptions } from './common'

export class EventService {
  constructor(private readonly client: AxiosInstance) {}

  getById(eventId: EventId, options?: CommonRequestOptions): Promise<DetailedEventDto> {
    return this.client.get(`/event/${eventId}`, { signal: options?.signal }).then(res => res.data)
  }

  getAll(params: GetEventsQueryDto, options?: CommonRequestOptions): Promise<PagedResponse<EventWithCountsDto>> {
    return this.client.get('/event', { params, signal: options?.signal }).then(res => res.data)
  }

  create(data: CreateEventInputDto): Promise<MiniEventDto> {
    return this.client.post('/event', data).then(res => res.data)
  }

  async update(eventId: EventId, data: UpdateEventInputDto): Promise<void> {
    await this.client.put(`/event/${eventId}`, data)
  }

  async delete(eventId: EventId): Promise<void> {
    await this.client.delete(`/event/${eventId}`)
  }
}
