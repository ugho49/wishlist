import { Transform } from 'class-transformer'
import { IsInt, IsOptional, IsPositive, Min } from 'class-validator'

export class GetPaginationQueryDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  declare p?: number
}

export class LimitQueryDto {
  @IsInt()
  @Min(1)
  @IsPositive()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  declare limit?: number
}

export class PaginationDto {
  declare total_pages: number
  declare total_elements: number
  declare page_number: number
  declare pages_size: number
}

export class PagedResponse<T> {
  declare resources: T[]
  declare pagination: PaginationDto
}
