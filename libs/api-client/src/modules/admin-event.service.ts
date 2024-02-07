import {
  type DetailedEventDto,
  type EventWithCountsDto,
  type GetEventsQueryDto,
  type PagedResponse,
} from '@wishlist/common-types';
import { ServiceConstructor } from '../modules.type';

export class AdminEventService {
  private getClient: ServiceConstructor['getClient'];

  constructor(params: ServiceConstructor) {
    this.getClient = params.getClient;
  }

  getById(eventId: string): Promise<DetailedEventDto> {
    return this.getClient()
      .get(`/admin/event/${eventId}`)
      .then((res) => res.data);
  }

  getAll(params: GetEventsQueryDto): Promise<PagedResponse<EventWithCountsDto>> {
    return this.getClient()
      .get(`/admin/event`, { params })
      .then((res) => res.data);
  }
}
