import type { ItemId, WishlistId } from '../ids'
import type { MiniUserDto } from './user.dto'

import { IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Max, MaxLength, Min } from 'class-validator'

export class ItemDto {
  declare id: ItemId
  declare name: string
  declare description?: string
  declare url?: string
  declare score?: number
  declare is_suggested?: boolean
  declare picture_url?: string
  declare taken_by?: MiniUserDto
  declare taken_at?: string
  declare created_at: string
}

export class ToggleItemOutputDto {
  declare taken_by?: MiniUserDto
  declare taken_at?: string
}

export class ScanItemOutputDto {
  declare picture_url: string | null
}

export class UpdateItemInputDto {
  @MaxLength(40)
  @IsString()
  @IsNotEmpty()
  declare name: string

  @MaxLength(60)
  @IsString()
  @IsOptional()
  declare description?: string

  @IsUrl()
  @MaxLength(1000)
  @IsOptional()
  declare url?: string

  @Min(0)
  @Max(5)
  @IsInt()
  @IsOptional()
  declare score?: number

  @IsUrl()
  @MaxLength(1000)
  @IsOptional()
  declare picture_url?: string
}

export class AddItemForListInputDto extends UpdateItemInputDto {
  @IsString()
  @IsNotEmpty()
  declare wishlist_id: WishlistId
}

export class ScanItemInputDto {
  @IsString()
  @IsNotEmpty()
  declare url: string
}
