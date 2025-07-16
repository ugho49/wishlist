import type { ItemId, WishlistId } from '../ids'

import { IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Max, MaxLength, Min } from 'class-validator'

import { MiniUserDto } from './user.dto'

export class ItemDto {
  id!: ItemId
  name!: string
  description?: string
  url?: string
  score?: number
  is_suggested?: boolean
  picture_url?: string
  taken_by?: MiniUserDto
  taken_at?: string
  created_at!: string
}

export class ToggleItemOutputDto {
  taken_by?: MiniUserDto
  taken_at?: string
}

export class ScanItemOutputDto {
  picture_url!: string | null
}

export class UpdateItemInputDto {
  @MaxLength(40)
  @IsString()
  @IsNotEmpty()
  name!: string

  @MaxLength(60)
  @IsString()
  @IsOptional()
  description?: string

  @MaxLength(1000)
  @IsOptional()
  @IsUrl()
  url?: string

  @Min(0)
  @Max(5)
  @IsInt()
  @IsOptional()
  score?: number

  @MaxLength(1000)
  @IsUrl()
  @IsOptional()
  picture_url?: string
}

export class AddItemForListInputDto extends UpdateItemInputDto {
  @IsString()
  @IsNotEmpty()
  wishlist_id!: WishlistId
}

export class ScanItemInputDto {
  @IsString()
  @IsNotEmpty()
  url!: string
}
