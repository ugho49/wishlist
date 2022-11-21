export class IdDto {
  id: string;
}

export type Pagination = {
  total_pages: number;
  total_elements: number;
  current_index: number;
  number: number; // TODO: later remove in favor of `current_index`
};

export class PagedResponse<T> {
  resources: T[];
  pagination: Pagination;
}
