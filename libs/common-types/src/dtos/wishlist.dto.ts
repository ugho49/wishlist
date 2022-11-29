import { MiniUserDto } from './user.dto';
import { MiniEventDto } from './event.dto';
import {
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

export class WishlistConfigDto {
  hide_items: boolean;
}

export class MiniWishlistDto {
  id: string;
  title: string;
  description?: string;
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
  description?: string;
}

export class CreateWishlistInputDto extends UpdateWishlistInputDto {
  @IsBoolean()
  @IsOptional()
  hide_items?: boolean;

  @ArrayUnique()
  @ArrayNotEmpty()
  @IsString({ each: true })
  event_ids: string[];

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AddItemInputDto)
  items: AddItemInputDto[] = [];
}
