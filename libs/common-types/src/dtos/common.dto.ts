import { Transform } from 'class-transformer'
import { IsInt, IsOptional, Min } from 'class-validator'

export class GetPaginationQueryDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  p?: number
}

export class PaginationDto {
  total_pages: number
  total_elements: number
  page_number: number
  pages_size: number
}

export class PagedResponse<T> {
  resources: T[]
  pagination: PaginationDto
}
