import type { EventId } from '../ids';

export class MiniEventDto {
  declare id: EventId;
  declare title: string;
  declare description?: string;
  declare icon?: string;
  declare event_date: string;
}
