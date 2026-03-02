import type { WishlistId, WishlistMessageId } from '../ids'
import type { MiniUserDto } from './user.dto'

import { Transform } from 'class-transformer'
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator'

export class WishlistMessageDto {
  declare id: WishlistMessageId
  declare content: string
  declare author: MiniUserDto
  declare created_at: string
}

export class CursorPaginatedWishlistMessagesDto {
  declare messages: WishlistMessageDto[]
  declare next_cursor?: string
  declare unread_count: number
}

export class WishlistMessageUnreadCountDto {
  declare unread_count: number
}

export class GetWishlistMessagesQueryDto {
  @IsString()
  @IsNotEmpty()
  declare wishlistId: WishlistId

  @IsString()
  @IsOptional()
  declare cursor?: string

  @IsInt()
  @Min(0)
  @Max(50)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  declare limit?: number
}

export class CreateWishlistMessageInputDto {
  @IsString()
  @IsNotEmpty()
  declare wishlist_id: WishlistId

  @MaxLength(500)
  @IsString()
  @IsNotEmpty()
  declare content: string
}

export class MarkWishlistMessagesAsReadInputDto {
  @IsString()
  @IsNotEmpty()
  declare wishlist_id: WishlistId
}
