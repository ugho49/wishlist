export class MiniEventDto {
  id: string;
  title: string;
  description?: string;
  event_date: string;
}

export class EventWithCountsDto {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  nb_wishlists: number;
  nb_attendees: number;
  created_at: string;
  updated_at: string;
}
