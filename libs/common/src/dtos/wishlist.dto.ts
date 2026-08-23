import type { EventId, WishlistId } from '../ids';
import type { MiniEventDto } from './event.dto';
import type { ItemDto } from './item.dto';
import type { MiniUserDto } from './user.dto';

import { ArrayMaxSize, ArrayNotEmpty, IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

import { MAX_EVENTS_BY_LIST } from '../constants';

export class WishlistConfigDto {
  declare hide_items: boolean;
}

export class UpdateWishlistLogoOutputDto {
  declare logo_url: string;
}

export class MiniWishlistDto {
  declare id: WishlistId;
  declare title: string;
  declare description?: string;
  declare logo_url?: string;
}

export class DetailedWishlistDto extends MiniWishlistDto {
  declare owner: MiniUserDto;
  declare co_owner?: MiniUserDto;
  declare items: ItemDto[];
  declare events: MiniEventDto[];
  declare config: WishlistConfigDto;
  declare created_at: string;
  declare updated_at: string;
}

export class WishlistWithOwnerDto extends MiniWishlistDto {
  declare owner: MiniUserDto;
  declare co_owner?: MiniUserDto;
  declare config: WishlistConfigDto;
  declare created_at: string;
  declare updated_at: string;
}

export class WishlistWithEventsDto extends WishlistWithOwnerDto {
  declare events: MiniEventDto[];
}

export class CreateWishlistInputDto {
  @MaxLength(100)
  @IsString()
  @IsNotEmpty()
  declare title: string;

  @MaxLength(2000)
  @IsString()
  @IsOptional()
  declare description?: string;

  @IsBoolean()
  @IsOptional()
  declare hide_items?: boolean;

  @ArrayMaxSize(MAX_EVENTS_BY_LIST)
  @IsString({ each: true })
  @ArrayNotEmpty()
  declare event_ids: EventId[];
}
