import {
  type CreateEventInputDto,
  type DetailedEventDto,
  type EventWithCountsDto,
  type GetEventsQueryDto,
  type MiniEventDto,
  type PagedResponse,
  type UpdateEventInputDto,
} from '@wishlist/common-types';
import { ServiceConstructor } from '../modules.type';

export class EventService {
  private getClient: ServiceConstructor['getClient'];

  constructor(params: ServiceConstructor) {
    this.getClient = params.getClient;
  }

  getById(eventId: string): Promise<DetailedEventDto> {
    return this.getClient()
      .get(`/event/${eventId}`)
      .then((res) => res.data);
  }

  getAll(params: GetEventsQueryDto): Promise<PagedResponse<EventWithCountsDto>> {
    return this.getClient()
      .get(`/event`, { params })
      .then((res) => res.data);
  }

  create(data: CreateEventInputDto): Promise<MiniEventDto> {
    return this.getClient()
      .post('/event', data)
      .then((res) => res.data);
  }

  async update(eventId: string, data: UpdateEventInputDto): Promise<void> {
    await this.getClient()
      .put(`/event/${eventId}`, data)
      .then((res) => res.data);
  }

  async delete(eventId: string): Promise<void> {
    await this.getClient()
      .delete(`/event/${eventId}`)
      .then((res) => res.data);
  }
}
