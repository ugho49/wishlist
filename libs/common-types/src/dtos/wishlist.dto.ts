import { MiniUserDto } from './user.dto';
import { MiniEventDto } from './event.dto';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { AddItemInputDto, ItemDto } from './item.dto';
import { Type } from 'class-transformer';
import { MAX_EVENTS_BY_LIST } from '../constants';

export class WishlistConfigDto {
  hide_items: boolean;
}

export class UpdateWishlistLogoOutputDto {
  logo_url: string;
}

export class MiniWishlistDto {
  id: string;
  title: string;
  description?: string;
  logo_url?: string;
}

export class DetailedWishlistDto extends MiniWishlistDto {
  owner: MiniUserDto;
  items: ItemDto[];
  events: MiniEventDto[];
  config: WishlistConfigDto;
  created_at: string;
  updated_at: string;
}

export class WishlistWithEventsDto extends MiniWishlistDto {
  events: MiniEventDto[];
  config: WishlistConfigDto;
  created_at: string;
  updated_at: string;
}

export class WishlistWithOwnerDto extends MiniWishlistDto {
  owner: MiniUserDto;
  config: WishlistConfigDto;
  created_at: string;
  updated_at: string;
}

export class LinkUnlinkWishlistInputDto {
  @IsUUID()
  @IsNotEmpty()
  event_id: string;
}

export class UpdateWishlistInputDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;
}

export class CreateWishlistInputDto extends UpdateWishlistInputDto {
  @IsBoolean()
  @IsOptional()
  hide_items?: boolean;

  @ArrayUnique()
  @ArrayNotEmpty()
  @ArrayMaxSize(MAX_EVENTS_BY_LIST)
  @IsString({ each: true })
  event_ids: string[];

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AddItemInputDto)
  items: AddItemInputDto[] = [];
}
