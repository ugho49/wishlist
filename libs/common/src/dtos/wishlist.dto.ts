import type { EventId } from '../ids';

import { ArrayMaxSize, ArrayNotEmpty, IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

import { MAX_EVENTS_BY_LIST } from '../constants';

export class UpdateWishlistLogoOutputDto {
  declare logo_url: string;
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
