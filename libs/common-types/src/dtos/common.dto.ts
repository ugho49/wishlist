import { IsInt, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetPaginationQueryDto {
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  p?: number;
}

export class PaginationDto {
  total_pages: number;
  total_elements: number;
  page_number: number;
}

export class PagedResponse<T> {
  resources: T[];
  pagination: PaginationDto;
}
