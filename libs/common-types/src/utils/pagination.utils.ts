import { PagedResponse } from '../dtos';

export function createPagedResponse<T>(params: {
  resources: T[];
  options: { pageSize: number; currentIndex?: number; totalElements: number };
}): PagedResponse<T> {
  const { options, resources } = params;
  const { currentIndex, totalElements, pageSize } = options;

  return {
    resources,
    pagination: {
      number: currentIndex || 0,
      current_index: currentIndex || 0,
      total_elements: totalElements,
      total_pages: Math.ceil(totalElements / pageSize),
    },
  };
}
