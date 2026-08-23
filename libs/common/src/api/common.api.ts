export class PaginationHttpResponse {
  declare total_pages: number;
  declare total_elements: number;
  declare page_number: number;
  declare pages_size: number;
}

export class PagedHttpResponse<T> {
  declare resources: T[];
  declare pagination: PaginationHttpResponse;
}
