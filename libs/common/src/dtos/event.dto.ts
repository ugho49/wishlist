import type { EventId } from '../ids';
import type { AttendeeDto } from './attendee.dto';
import type { WishlistWithOwnerDto } from './wishlist.dto';

export class MiniEventDto {
  declare id: EventId;
  declare title: string;
  declare description?: string;
  declare icon?: string;
  declare event_date: string;
}

export class EventWithCountsDto extends MiniEventDto {
  declare nb_wishlists: number;
  declare attendees: AttendeeDto[];
  declare created_at: string;
  declare updated_at: string;
}

export class DetailedEventDto extends MiniEventDto {
  declare wishlists: WishlistWithOwnerDto[];
  declare attendees: AttendeeDto[];
  declare created_at: string;
  declare updated_at: string;
}
