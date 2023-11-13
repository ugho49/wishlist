import { IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { MiniUserDto } from './user.dto';
import { Transform } from 'class-transformer';
import { TidyURL } from 'tidy-url';

export class ItemDto {
  id: string;
  name: string;
  description?: string;
  url?: string;
  score?: number;
  is_suggested?: boolean;
  picture_url?: string;
  taken_by?: MiniUserDto;
  taken_at?: string;
  created_at: string;
}

export class ToggleItemOutputDto {
  taken_by?: MiniUserDto;
  taken_at?: string;
}

export class ScanItemOutputDto {
  picture_url: string | null;
}

export class AddItemInputDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(60)
  description?: string;

  @IsUrl()
  @IsOptional()
  @MaxLength(1000)
  @Transform(({ value }) => TidyURL.clean(value).url)
  url?: string;

  @IsInt()
  @Min(0)
  @Max(5)
  @IsOptional()
  score?: number;

  @IsUrl()
  @IsOptional()
  @MaxLength(1000)
  picture_url?: string;
}

export class AddItemForListInputDto extends AddItemInputDto {
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  wishlist_id: string;
}

export class ScanItemInputDto {
  @IsString()
  @IsNotEmpty()
  url: string;
}
