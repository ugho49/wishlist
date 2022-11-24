import { IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Max, MaxLength, Min } from 'class-validator';
import { MiniUserDto } from './user.dto';

export class ItemDto {
  id: string;
  name: string;
  description?: string;
  url?: string;
  score?: number;
  is_suggested?: boolean;
  taken_by?: MiniUserDto;
  taken_at?: string;
  created_at: string;
}

export class AddSingleItemInputDto {
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
  url?: string;

  @IsInt()
  @Min(0)
  @Max(5)
  @IsOptional()
  score?: number;
}
