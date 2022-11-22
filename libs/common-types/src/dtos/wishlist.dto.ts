import { MiniUserDto } from './user.dto';
import { MiniEventDto } from './event.dto';

export class WishlistConfigDto {
  hideItems: boolean;
}

export class DetailledWishlistDto {
  id: string;
  title: string;
  description: string;
  owner: MiniUserDto;
  items: any[]; // TODO: ItemDto
  events: MiniEventDto[];
  config: WishlistConfigDto;
  created_at: string;
  updated_at: string;
}

export class WishlistWithEventsDto {
  id: string;
  title: string;
  description?: string;
  events: MiniEventDto[];
  config: WishlistConfigDto;
  created_at: string;
  updated_at: string;
}

export class WishlistWithOwnerDto {
  id: string;
  title: string;
  description?: string;
  owner: MiniUserDto;
  config: WishlistConfigDto;
  created_at: string;
  updated_at: string;
}
