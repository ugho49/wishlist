import { ArrayMaxSize, ArrayNotEmpty, IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

import { MAX_EVENTS_BY_LIST } from '../constants'
import { EventId, UserId, WishlistId } from '../ids'
import { GetPaginationQueryDto } from './common.dto'
import { MiniEventDto } from './event.dto'
import { ItemDto } from './item.dto'
import { MiniUserDto } from './user.dto'

export class WishlistConfigDto {
  declare hide_items: boolean
}

export class UpdateWishlistLogoOutputDto {
  declare logo_url: string
}

export class MiniWishlistDto {
  declare id: WishlistId
  declare title: string
  declare description?: string
  declare logo_url?: string
}

export class DetailedWishlistDto extends MiniWishlistDto {
  declare owner: MiniUserDto
  declare items: ItemDto[]
  declare events: MiniEventDto[]
  declare config: WishlistConfigDto
  declare created_at: string
  declare updated_at: string
}

export class WishlistWithEventsDto extends MiniWishlistDto {
  declare events: MiniEventDto[]
  declare config: WishlistConfigDto
  declare created_at: string
  declare updated_at: string
}

export class WishlistWithOwnerDto extends MiniWishlistDto {
  declare owner: MiniUserDto
  declare config: WishlistConfigDto
  declare created_at: string
  declare updated_at: string
}

export class GetAllWishlistsPaginationQueryDto extends GetPaginationQueryDto {
  @IsString()
  @IsNotEmpty()
  declare user_id: UserId
}

export class LinkUnlinkWishlistInputDto {
  @IsString()
  @IsNotEmpty()
  declare event_id: EventId
}

export class UpdateWishlistInputDto {
  @MaxLength(100)
  @IsString()
  @IsNotEmpty()
  declare title: string

  @MaxLength(2000)
  @IsString()
  @IsOptional()
  declare description?: string
}

export class CreateWishlistInputDto extends UpdateWishlistInputDto {
  @IsBoolean()
  @IsOptional()
  declare hide_items?: boolean

  @ArrayMaxSize(MAX_EVENTS_BY_LIST)
  @IsString({ each: true })
  @ArrayNotEmpty()
  declare event_ids: EventId[]
}
