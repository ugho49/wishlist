export class PaginationDto {
  declare total_pages: number;
  declare total_elements: number;
  declare page_number: number;
  declare pages_size: number;
}

export class PagedResponse<T> {
  declare resources: T[];
  declare pagination: PaginationDto;
}
