import type { WishlistId, WishlistMessageId } from '../ids'
import type { MiniUserDto } from './user.dto'

import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class WishlistMessageDto {
  declare id: WishlistMessageId
  declare content: string
  declare author: MiniUserDto
  declare created_at: string
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
