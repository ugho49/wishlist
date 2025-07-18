import { ArrayMaxSize, ArrayNotEmpty, IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

import { MAX_EVENTS_BY_LIST } from '../constants'
import { EventId, UserId, WishlistId } from '../ids'
import { GetPaginationQueryDto } from './common.dto'
import { MiniEventDto } from './event.dto'
import { ItemDto } from './item.dto'
import { MiniUserDto } from './user.dto'

export class WishlistConfigDto {
  hide_items!: boolean
}

export class UpdateWishlistLogoOutputDto {
  logo_url!: string
}

export class MiniWishlistDto {
  id!: WishlistId
  title!: string
  description?: string
  logo_url?: string
}

export class DetailedWishlistDto extends MiniWishlistDto {
  owner!: MiniUserDto
  items!: ItemDto[]
  events!: MiniEventDto[]
  config!: WishlistConfigDto
  created_at!: string
  updated_at!: string
}

export class WishlistWithEventsDto extends MiniWishlistDto {
  events!: MiniEventDto[]
  config!: WishlistConfigDto
  created_at!: string
  updated_at!: string
}

export class WishlistWithOwnerDto extends MiniWishlistDto {
  owner!: MiniUserDto
  config!: WishlistConfigDto
  created_at!: string
  updated_at!: string
}

export class GetAllWishlistsPaginationQueryDto extends GetPaginationQueryDto {
  @IsString()
  @IsNotEmpty()
  user_id!: UserId
}

export class LinkUnlinkWishlistInputDto {
  @IsString()
  @IsNotEmpty()
  event_id!: EventId
}

export class UpdateWishlistInputDto {
  @MaxLength(100)
  @IsString()
  @IsNotEmpty()
  title!: string

  @MaxLength(2000)
  @IsString()
  @IsOptional()
  description?: string
}

export class CreateWishlistInputDto extends UpdateWishlistInputDto {
  @IsBoolean()
  @IsOptional()
  hide_items?: boolean

  @ArrayMaxSize(MAX_EVENTS_BY_LIST)
  @IsString({ each: true })
  @ArrayNotEmpty()
  event_ids!: EventId[]
}
