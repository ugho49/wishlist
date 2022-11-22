import { IsInt, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class IdDto {
  id: string;
}

export class GetPaginationQueryDto {
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  p?: number = 0;
}

export class PaginationDto {
  total_pages: number;
  total_elements: number;
  current_index: number;
  number: number; // TODO: later remove in favor of `current_index`
}

export class PagedResponse<T> {
  resources: T[];
  pagination: PaginationDto;
}
