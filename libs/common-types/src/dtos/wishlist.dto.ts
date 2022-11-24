import { MiniUserDto } from './user.dto';
import { MiniEventDto } from './event.dto';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
  ArrayUnique,
} from 'class-validator';
import { AddSingleItemInputDto } from './item.dto';
import { Type } from 'class-transformer';

export class WishlistConfigDto {
  hideItems: boolean;
}

export class MiniWishlistDto {
  id: string;
  title: string;
  description?: string;
}

export class DetailledWishlistDto extends MiniWishlistDto {
  owner: MiniUserDto;
  items: any[]; // TODO: ItemDto
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

export class CreateWishlistInputDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

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
  @Type(() => AddSingleItemInputDto)
  items: AddSingleItemInputDto[] = [];
}
